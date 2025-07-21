# Admin Moderation System Documentation

## Overview
The admin moderation system provides comprehensive control over user accounts, content, and platform activity. This system is designed to maintain platform integrity and user safety through powerful yet accountable moderation tools.

## Access Control
- **Role-Based Access**: Only users with explicit 'admin' role can access moderation features
- **Protected Routes**: All admin routes require authentication and role verification
- **Security**: Non-admin users are automatically redirected to their appropriate dashboards
- **Access Path**: `/admin` routes protected by `AdminGuard` component

## Core Features

### 1. User Management
#### Account Control
- Lock/unlock user accounts
- Set restriction durations:
  - Permanent bans
  - Temporary restrictions (custom duration in days)
- Document restriction reasons
- View complete moderation history

#### Implementation
```typescript
// Lock a user account
await AdminModerationService.lockUser({
  userId: string,
  reason: string,
  expiresAt?: Date  // Optional for temporary locks
});

// Unlock a user account
await AdminModerationService.unlockUser(userId: string);
```

### 2. Content Moderation
#### Media Moderation
- Review photos and videos
- Take down inappropriate content
- Handle user reports
- Access via: `/admin/media`

#### Comment Moderation
- Review user comments
- Remove inappropriate content
- Handle reported comments
- Access via: `/admin/comments`

### 3. Moderation Logs
All moderation actions are logged with:
- Timestamp
- Admin identifier
- Action type
- Reason for action
- Duration (for temporary actions)
- Target user/content

## Database Structure

### Key Tables
1. **Users Table**
   - `is_locked`: boolean
   - `locked_at`: timestamp
   - `locked_reason`: text
   - `lock_expires_at`: timestamp

2. **Moderation Logs**
   - Action details
   - Timestamps
   - Admin references
   - Target references

3. **Content Reports**
   - Report details
   - Reporter information
   - Content references
   - Status tracking

## User Interface

### Admin Dashboard
- **Path**: `/admin`
- **Features**:
  - Overview statistics
  - Quick access to moderation tools
  - Recent activity summary

### User Management Interface
- **Path**: `/admin/users`
- **Features**:
  - List of locked users
  - Lock/unlock controls
  - User history view
  - Pagination for large lists

### Media Moderation Interface
- **Path**: `/admin/media`
- **Features**:
  - Grid view of media items
  - Quick moderation actions
  - Content filtering options

### Comment Moderation Interface
- **Path**: `/admin/comments`
- **Features**:
  - List view of comments
  - Context display
  - Quick moderation actions

## Security Measures

### Authentication
- Strict role verification
- Session management
- Secure route protection

### Database Security
- Row Level Security (RLS) policies
- Admin-specific access rules
- Audit logging

### Action Accountability
- All actions require documentation
- Complete audit trail
- Timestamped records

## Best Practices

### When Moderating
1. Always provide clear reasons for actions
2. Use temporary locks for first offenses
3. Document unusual cases
4. Review user history before taking action

### System Maintenance
1. Regularly review moderation logs
2. Monitor for patterns of abuse
3. Update moderation guidelines as needed
4. Maintain consistent enforcement

## Technical Implementation

### Admin Guard Example
```typescript
export const AdminGuard: React.FC = ({ children }) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  
  if (!user || profile?.role !== 'admin') {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
```

### Moderation Service Example
```typescript
class AdminModerationService {
  static async lockUser({ userId, reason, expiresAt }) {
    // Implementation
  }

  static async unlockUser(userId) {
    // Implementation
  }

  static async getUserModerationLogs(userId) {
    // Implementation
  }
}
```

## Support and Maintenance

### Error Handling
- Clear error messages
- Fallback behaviors
- Recovery procedures

### Performance
- Pagination for large datasets
- Optimized queries
- Efficient content loading

### Scalability
- Modular design
- Extensible architecture
- Future feature support 