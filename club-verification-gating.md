# Club Verification Gating System

## Overview
Implement access control to ensure clubs complete verification before accessing main dashboard features.

## Current State
- ClubVerification page exists with UI but no backend functionality
- Dashboard allows full access without verification check
- `clubs.verification_status` field exists: 'pending' | 'verified' | 'rejected'

## Proposed Implementation

### 1. Dashboard Access Control
```typescript
// In useClubDashboard hook or dashboard component
const requireVerification = (clubProfile: ClubProfile) => {
  return clubProfile.verification_status !== 'verified';
};

// Dashboard state
const isVerificationRequired = clubProfile ? requireVerification(clubProfile) : false;
```

### 2. UI Implementation Options

#### Option A: Redirect to Verification
```typescript
if (isVerificationRequired) {
  return <Navigate to="/verify" replace />;
}
```

#### Option B: Overlay with Limited Access
```typescript
<div className={`${isVerificationRequired ? 'opacity-50 pointer-events-none' : ''}`}>
  {/* Dashboard content */}
</div>
{isVerificationRequired && <VerificationOverlay />}
```

#### Option C: Progressive Access
- Allow basic profile setup
- Gray out advanced features (promotions, credits, ladies management)
- Show verification banner

### 3. Verification Status Components

#### Banner Component
```typescript
const VerificationBanner = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <PendingVerificationBanner />;
    case 'rejected':
      return <RejectedVerificationBanner />;
    case 'verified':
      return <VerifiedBadge />;
  }
};
```

#### Feature Gates
```typescript
const FeatureGate = ({ 
  requiresVerification, 
  userStatus, 
  children 
}: FeatureGateProps) => {
  if (requiresVerification && userStatus !== 'verified') {
    return <VerificationRequiredMessage />;
  }
  return children;
};
```

### 4. Database Schema Updates

#### clubs table (already exists)
```sql
verification_status: 'pending' | 'verified' | 'rejected'
```

#### club_verification_documents table (already exists)
```sql
- document_type: 'license' | 'registration' | 'tax_id' | 'photo'
- verification_status: 'pending' | 'approved' | 'rejected'
- file_url, upload_status, etc.
```

### 5. Verification Workflow

1. **Club Registration**: Status starts as 'pending'
2. **Document Upload**: Files uploaded to Supabase Storage
3. **Admin Review**: Manual verification process
4. **Status Update**: Admin updates verification_status
5. **Dashboard Access**: Features unlock based on status

### 6. Implementation Priority

#### Phase 1 (Immediate)
- [x] Make ClubVerification page functional
- [ ] Add verification status to useClubDashboard hook
- [ ] Implement basic access control

#### Phase 2 (Future)
- [ ] Admin verification dashboard
- [ ] Automated document validation
- [ ] Email notifications for status changes
- [ ] Progressive feature unlocking

### 7. User Experience Considerations

#### Verification Pending
- Show clear progress indicators
- Explain next steps and timeline
- Allow basic profile completion
- Disable credit purchases and promotions

#### Verification Rejected
- Clear explanation of rejection reasons
- Easy re-upload process
- Support contact information
- Temporary access restrictions

#### Verification Approved
- Celebration/welcome message
- Full dashboard access
- Verified badge display
- Premium feature access

### 8. Technical Implementation

#### Route Protection
```typescript
// In App.tsx or route configuration
<Route path="/dashboard/*" element={
  <ProtectedRoute requireVerification={true}>
    <ClubDashboard />
  </ProtectedRoute>
} />
```

#### Hook Integration
```typescript
// In useClubDashboard
const { clubProfile, isVerified, verificationStatus } = useClubDashboard();

// Feature-specific checks
const canCreatePromotions = isVerified;
const canBuyCredits = isVerified;
const canManageLadies = isVerified;
```

### 9. Future Enhancements

- Tiered verification (basic vs premium)
- Document expiration tracking
- Automated re-verification reminders
- Integration with external verification services
- Real-time status updates via WebSocket

## Files to Modify

1. `src/pages/ClubVerification.tsx` - Make functional
2. `src/hooks/useClubDashboard.ts` - Add verification checks
3. `src/pages/dashboard/ClubDashboard.tsx` - Add access control
4. `src/services/clubService.ts` - Add verification methods
5. `src/components/VerificationBanner.tsx` - New component
6. `src/components/FeatureGate.tsx` - New component

## Database Functions Needed

```sql
-- Get verification status
CREATE OR REPLACE FUNCTION get_club_verification_status(p_club_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (SELECT verification_status FROM clubs WHERE id = p_club_id);
END;
$$ LANGUAGE plpgsql;

-- Update verification status (admin only)
CREATE OR REPLACE FUNCTION update_club_verification_status(
  p_club_id uuid, 
  p_status text,
  p_admin_id uuid
)
RETURNS void AS $$
BEGIN
  UPDATE clubs 
  SET verification_status = p_status, updated_at = now()
  WHERE id = p_club_id;
  
  -- Log verification change
  INSERT INTO club_activity (club_id, activity_type, actor_id, metadata)
  VALUES (p_club_id, 'verification_status_change', p_admin_id, 
          json_build_object('new_status', p_status));
END;
$$ LANGUAGE plpgsql;
``` 