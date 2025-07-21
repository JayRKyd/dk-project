# Lady Membership Access Control Implementation Plan

## Overview
This plan outlines the implementation of strict access controls to ensure FREE tier ladies cannot access PRO features without upgrading, while providing a testing backdoor for development purposes.

**Current Implementation Scope**: FREE and PRO tiers only (PRO-PLUS and ULTRA will be added in Phase 2 - see MEMBERSHIP_TIERS_IMPLEMENTATION_NOTES.md)

## Current State Analysis

### Authentication & Routing
- **Current Protection**: Basic role-based routing in `RoleBasedRedirect.tsx`
- **Membership Detection**: `getUserMembershipTier()` in `authUtils.ts`
- **Route Separation**: `/dashboard/lady/free` vs `/dashboard/lady` (PRO)

### Gap Analysis
1. **No Route Guards**: Free users can manually navigate to PRO routes
2. **Component-Level Protection**: Missing membership tier checks in individual components
3. **API Endpoint Security**: No backend validation of membership tier for feature access
4. **Feature Hijacking**: Free users could potentially access PRO API endpoints

## Implementation Strategy

### Phase 1: Frontend Protection Layer

#### 1.1 Create Membership Guard Component
```typescript
// src/components/auth/MembershipGuard.tsx
interface MembershipGuardProps {
  requiredTier: 'FREE' | 'PRO';  // Simplified to just FREE and PRO
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const MembershipGuard: React.FC<MembershipGuardProps> = ({
  requiredTier,
  children,
  fallback,
  redirectTo
}) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  
  const userTier = getUserMembershipTier(user);
  const hasAccess = checkMembershipAccess(userTier, requiredTier);
  
  if (!hasAccess) {
    if (redirectTo) {
      navigate(redirectTo);
      return null;
    }
    return fallback || <UpgradePrompt requiredTier={requiredTier} />;
  }
  
  return <>{children}</>;
};

// Helper function for simplified FREE vs PRO access checking
const checkMembershipAccess = (userTier: string, requiredTier: string): boolean => {
  if (requiredTier === 'FREE') return true; // Everyone can access FREE features
  if (requiredTier === 'PRO') return userTier === 'PRO'; // Only PRO users can access PRO features
  return false;
};
```

#### 1.2 Update Route Protection
```typescript
// src/App.tsx - Update routes with membership guards
<Route path="/dashboard/lady" element={
  <ProtectedRoute requiredRole="lady">
    <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/free">
      <LadyDashboard />
    </MembershipGuard>
  </ProtectedRoute>
} />

<Route path="/dashboard/lady/fan-posts" element={
  <ProtectedRoute requiredRole="lady">
    <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/upgrade">
      <ManageFanPosts />
    </MembershipGuard>
  </ProtectedRoute>
} />
```

#### 1.3 Feature-Level Component Guards
```typescript
// src/components/feature/FeatureGate.tsx
export const FeatureGate: React.FC<{
  feature: 'fan_posts' | 'online_bookings' | 'gifts' | 'analytics';
  children: React.ReactNode;
}> = ({ feature, children }) => {
  const hasAccess = useFeatureAccess(feature);
  
  if (!hasAccess) {
    return <FeatureUpgradePrompt feature={feature} />;
  }
  
  return <>{children}</>;
};
```

### Phase 2: Backend Protection Layer

#### 2.1 Create Membership Validation Service
```typescript
// src/services/membershipValidationService.ts
export const membershipValidationService = {
  async validateFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('user_id', userId)
      .single();
    
    if (error || !profile) return false;
    
    return validateTierForFeature(profile.membership_tier, feature);
  },
  
  async validateAPIAccess(userId: string, endpoint: string): Promise<boolean> {
    const requiredTier = getRequiredTierForEndpoint(endpoint);
    const userTier = await this.getUserTier(userId);
    return checkMembershipAccess(userTier, requiredTier);
  }
};
```

#### 2.2 API Endpoint Protection
```typescript
// src/services/protectedApiService.ts
export const protectedApiCall = async (
  endpoint: string,
  method: string,
  data?: any,
  requiredTier: string = 'FREE'
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const hasAccess = await membershipValidationService.validateAPIAccess(
    user.id, 
    endpoint
  );
  
  if (!hasAccess) {
    throw new Error(`Upgrade to ${requiredTier} required for this feature`);
  }
  
  return supabase.from(endpoint)[method](data);
};
```

### Phase 3: Database-Level Protection

#### 3.1 Row Level Security (RLS) Policies
```sql
-- Supabase RLS for fan_posts table (PRO only feature)
CREATE POLICY "Users can only access fan_posts if PRO" ON fan_posts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.membership_tier = 'PRO'
  )
);

-- Supabase RLS for bookings table (PRO ladies can manage, clients can book any lady)
CREATE POLICY "Lady bookings require PRO membership" ON bookings
FOR ALL USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'lady' THEN
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.membership_tier = 'PRO'
      )
    ELSE true  -- Clients can book with any lady
  END
);

-- Supabase RLS for gifts table (PRO ladies can manage gifts)
CREATE POLICY "Lady gift management requires PRO membership" ON gifts
FOR ALL USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'lady' THEN
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.membership_tier = 'PRO'
      )
    ELSE true  -- Clients can send gifts to any lady
  END
);
```

#### 3.2 Membership Tier Enforcement Functions
```sql
-- Function to check if user has required membership tier (simplified for FREE/PRO)
CREATE OR REPLACE FUNCTION check_membership_tier(required_tier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
BEGIN
  SELECT membership_tier INTO user_tier
  FROM profiles
  WHERE user_id = auth.uid();
  
  RETURN CASE
    WHEN required_tier = 'FREE' THEN true  -- Everyone has FREE access
    WHEN required_tier = 'PRO' AND user_tier = 'PRO' THEN true
    ELSE false
  END;
END;
$$;

-- Helper function to check if user is PRO
CREATE OR REPLACE FUNCTION is_pro_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND membership_tier = 'PRO'
  );
END;
$$;
```

## Testing Backdoor Implementation

### 1. Development Testing Account Creation

#### 1.1 Admin Panel for Account Creation
```typescript
// src/pages/admin/CreateTestAccount.tsx
export default function CreateTestAccount() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'lady',
    membershipTier: 'PRO',
    isTestAccount: true
  });
  
  const handleCreateAccount = async () => {
    // Create test account with specific membership tier
    const { data, error } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      user_metadata: {
        name: formData.name,
        role: formData.role,
        membership_tier: formData.membershipTier,
        is_test_account: true,
        created_by_admin: true
      }
    });
    
    if (!error) {
      // Create profile entry
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        name: formData.name,
        role: formData.role,
        membership_tier: formData.membershipTier,
        is_test_account: true
      });
    }
  };
}
```

#### 1.2 Environment-Based Backdoor
```typescript
// src/utils/developmentUtils.ts
export const isDevelopmentMode = () => {
  return process.env.NODE_ENV === 'development' || 
         process.env.REACT_APP_ENVIRONMENT === 'staging';
};

export const canBypassMembershipCheck = (user: any) => {
  return isDevelopmentMode() && 
         user?.user_metadata?.is_test_account === true;
};

// Update MembershipGuard to include bypass
export const MembershipGuard: React.FC<MembershipGuardProps> = ({
  requiredTier,
  children,
  fallback,
  redirectTo
}) => {
  const { user } = useAuth();
  const userTier = getUserMembershipTier(user);
  
  // Development bypass
  if (canBypassMembershipCheck(user)) {
    return <>{children}</>;
  }
  
  const hasAccess = checkMembershipAccess(userTier, requiredTier);
  // ... rest of component
};
```

### 2. Supabase Testing Setup

#### 2.1 Test Data Creation Function
```sql
-- Create function to generate test accounts
CREATE OR REPLACE FUNCTION create_test_lady_account(
  p_email text,
  p_name text,
  p_tier text DEFAULT 'PRO'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Only allow in development
  IF current_setting('app.environment', true) != 'development' THEN
    RAISE EXCEPTION 'Test account creation only allowed in development';
  END IF;
  
  -- Generate UUID for test user
  new_user_id := gen_random_uuid();
  
  -- Insert test profile
  INSERT INTO profiles (
    user_id,
    name,
    email,
    role,
    membership_tier,
    is_test_account,
    created_at
  ) VALUES (
    new_user_id,
    p_name,
    p_email,
    'lady',
    p_tier,
    true,
    now()
  );
  
  RETURN new_user_id;
END;
$$;
```

#### 2.2 Quick Test Account Creation Script
```typescript
// src/scripts/createTestAccounts.ts
export const createTestAccounts = async () => {
  const testAccounts = [
    { email: 'test-free-lady@dk-dev.com', name: 'Test Free Lady', tier: 'FREE' },
    { email: 'test-pro-lady@dk-dev.com', name: 'Test Pro Lady', tier: 'PRO' }
  ];
  
  for (const account of testAccounts) {
    await supabase.rpc('create_test_lady_account', {
      p_email: account.email,
      p_name: account.name,
      p_tier: account.tier
    });
  }
  
  console.log('Created test accounts:');
  console.log('- FREE: test-free-lady@dk-dev.com / test123456');
  console.log('- PRO: test-pro-lady@dk-dev.com / test123456');
};
```

#### 2.3 Test Account Credentials (Development Only)

**Test Account Details:**
```
FREE Account:
  Email: test-free-lady@dk-dev.com
  Password: test123456
  Tier: FREE
  Access: Basic dashboard features only

PRO Account:
  Email: test-pro-lady@dk-dev.com
  Password: test123456
  Tier: PRO  
  Access: All features (fan posts, bookings, gifts, etc.)
```

**Important Notes:**
- These accounts have `is_test_account: true` metadata
- Bypass restrictions automatically in development mode
- Use these credentials to test membership access controls
- Both accounts are created via the Test Interface in the FREE dashboard

## Implementation Priority

### High Priority (Week 1)
1. ✅ Create MembershipGuard component
2. ✅ Update existing routes with guards
3. ✅ Implement testing backdoor system
4. ✅ Create admin test account creation interface

### Medium Priority (Week 2)
1. ✅ Add API endpoint protection
2. ✅ Implement database RLS policies
3. ✅ Create comprehensive feature gating system
4. ✅ Add membership validation service

### Low Priority (Week 3)
1. ✅ Performance optimization
2. ✅ Error handling improvements
3. ✅ Audit logging for access attempts
4. ✅ Automated testing suite for membership restrictions

## Testing Strategy

### Manual Testing Checklist
- [ ] FREE user cannot access `/dashboard/lady` (PRO dashboard)
- [ ] FREE user gets redirected to `/dashboard/lady/free` 
- [ ] FREE user cannot access fan posts features
- [ ] FREE user cannot access online booking management
- [ ] FREE user cannot access gifts management features
- [ ] PRO user can access `/dashboard/lady` (PRO dashboard)
- [ ] PRO user can access all PRO features (fan posts, bookings, gifts)
- [ ] Development test accounts can bypass restrictions
- [ ] Production accounts respect all restrictions
- [ ] Direct URL navigation is properly blocked for FREE users

### Automated Testing
```typescript
// src/tests/membershipAccess.test.ts
describe('Membership Access Control', () => {
  test('FREE user redirected from PRO routes', async () => {
    const freeUser = await createTestUser('FREE');
    render(<App />, { user: freeUser });
    
    fireEvent.click(screen.getByText('Visit PRO Dashboard'));
    expect(window.location.pathname).toBe('/dashboard/lady/free');
  });
  
  test('PRO user can access PRO features', async () => {
    const proUser = await createTestUser('PRO');
    render(<App />, { user: proUser });
    
    fireEvent.click(screen.getByText('Fan Posts'));
    expect(screen.getByText('Create Fan Post')).toBeInTheDocument();
  });
});
```

## Security Considerations

### 1. Client-Side Security
- All client-side guards are **UX enhancements only**
- Real security must be enforced server-side
- Assume all frontend code can be bypassed

### 2. API Security
- Every protected endpoint must validate membership tier
- Use JWT claims for quick tier checking
- Implement rate limiting for upgrade attempts

### 3. Database Security
- Row Level Security (RLS) as final protection layer
- Audit trails for membership changes
- Regular security reviews of policies

## Production Deployment Checklist

### Pre-Production
- [ ] Remove all testing backdoors
- [ ] Verify RLS policies are active
- [ ] Test all protected endpoints
- [ ] Validate upgrade flow works correctly
- [ ] Ensure error messages are user-friendly

### Post-Production
- [ ] Monitor membership tier enforcement
- [ ] Track upgrade conversion rates
- [ ] Review security logs for bypass attempts
- [ ] Validate billing integration works with tiers

## Conclusion

This implementation provides multiple layers of protection:
1. **UX Layer**: Frontend guards and redirects
2. **API Layer**: Endpoint validation
3. **Database Layer**: RLS policies

The testing backdoor allows development while maintaining production security. The phased approach ensures gradual implementation with proper testing at each stage. 