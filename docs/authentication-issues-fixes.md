# Authentication: Role and Subscription Status Handling Issues

## Identified Issues

### 1. Inconsistent Role Storage

**Current Implementation:**
- Role is stored in `user_metadata` during signup
- Role is checked in `user_metadata` in `ProtectedRoute`
- No centralized way to get user role

**Potential Problems:**
- Role might be stored in multiple places (`user_metadata`, `app_metadata`, JWT, or database)
- Updates to role in one place might not be reflected in others
- No single source of truth for user roles

### 2. Missing Subscription Status

**Current Implementation:**
- `RoleBasedRedirect` checks for `subscription_status` in `user_metadata`
- No default value is set during signup
- No clear way to update subscription status

**Potential Problems:**
- All users default to free tier due to undefined `subscription_status`
- No way to upgrade/downgrade subscription status
- Inconsistent user experience

## Recommended Fixes

### 1. Centralize Role and Status Management

Create utility functions to handle role and subscription status consistently:

```typescript
// utils/auth-utils.ts
export const getUserRole = (user: User | null): string | null => {
  if (!user) return null;
  
  // Check in order of preference
  return user.user_metadata?.role || 
         user.app_metadata?.role || 
         user.role || 
         'guest';
};

export const getSubscriptionStatus = (user: User | null): string => {
  if (!user) return 'free';
  
  // Check in order of preference
  return user.user_metadata?.subscription_status || 
         user.app_metadata?.subscription_status || 
         'free'; // Default to free
};
```

### 2. Update ProtectedRoute Component

```typescript
// components/auth/ProtectedRoute.tsx
import { getUserRole } from '../../utils/auth-utils';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getUserRole(user);
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### 3. Update Signup Flow

```typescript
// In AuthContext.tsx signUp function
const signUp = async (email: string, password: string, username: string, role: string = 'client') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        role,
        subscription_status: 'free', // Set default
      },
    },
  });
  // ...
};
```

### 4. Add User Profile Sync Hook

```typescript
// hooks/useUserProfile.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        // Update user metadata with the latest from database
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            role: data.role,
            subscription_status: data.subscription_status,
          }
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
};
```

## Implementation Plan

1. Create the utility functions in `utils/auth-utils.ts`
2. Update `ProtectedRoute` component
3. Update signup flow to include default subscription status
4. Create the `useUserProfile` hook
5. Update components to use the new utilities
6. Add error boundaries and loading states
7. Write tests for the new functionality

## Testing Strategy

1. Test role-based access control
2. Test subscription status changes
3. Verify data consistency across auth and database
4. Test edge cases (missing data, network issues)
5. Verify session persistence

## Rollback Plan

1. Keep the old components as backup
2. Use feature flags if possible
3. Monitor error rates after deployment
4. Have a rollback script ready

## Future Improvements

1. Add admin interface for role management
2. Implement subscription webhooks
3. Add audit logging for role changes
4. Implement role-based UI components
