# Admin Moderation System Implementation Plan

## Overview
This document outlines the implementation plan for enhanced admin moderation features including account management, content moderation, and financial tracking capabilities.

## 1. Account Management System

### Account Locking Feature
- **Database Changes**
  ```sql
  -- Add to users table
  ALTER TABLE public.users
  ADD COLUMN is_locked BOOLEAN DEFAULT false,
  ADD COLUMN locked_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN locked_reason TEXT,
  ADD COLUMN lock_expires_at TIMESTAMP WITH TIME ZONE;
  ```

- **Admin Interface**
  - New page: `/admin/user-management`
  - Features:
    - User search and filtering
    - Lock/unlock accounts
    - Set lock duration (temporary/permanent)
    - Add lock reason
    - View lock history

- **API Endpoints**
  ```typescript
  // adminUserService.ts
  lockUser(userId: string, reason: string, expiresAt?: Date): Promise<void>
  unlockUser(userId: string): Promise<void>
  getLockHistory(userId: string): Promise<LockHistory[]>
  ```

## 2. Content Moderation System

### Media Management
- **New Admin Page**: `/admin/media-moderation`
- **Features**:
  - Grid view of all uploaded media
  - Filter by:
    - User type (Lady/Client/Club)
    - Media type (Photo/Video)
    - Upload date
    - Reported content
  - Actions:
    - Remove media
    - Issue warning
    - Lock account
  - Audit log of moderation actions

### Comment Moderation
- **New Admin Page**: `/admin/comment-moderation`
- **Features**:
  - View all comments across:
    - Photos
    - Fan Posts
    - Gifts
    - Reviews
  - Filter by:
    - Content type
    - User type
    - Date range
    - Reported comments
  - Actions:
    - Remove comments
    - Issue warnings
    - Lock accounts
  - Automated content filtering for:
    - Offensive language
    - Violence
    - Inappropriate content

### Review Management
- **New Admin Page**: `/admin/review-moderation`
- **Features**:
  - View all reviews
  - Filter by:
    - Rating
    - Date
    - Reported reviews
    - User/Lady/Club
  - Actions:
    - Temporarily hide reviews
    - Permanently remove reviews
    - Issue warnings
    - Lock accounts

## 3. Financial Tracking System

### Transaction Dashboard
- **New Admin Page**: `/admin/financial-dashboard`
- **Features**:
  - Transaction Overview:
    - Total platform revenue
    - Credit purchases
    - Credit spending
    - Commission tracking
  - Detailed Views:
    - Per user transactions
    - Per lady earnings
    - Per club revenue
    - Platform earnings

### Database Schema Updates
```sql
-- Transaction tracking improvements
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    transaction_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    credits_amount INTEGER,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB
);

-- Transaction types enum
CREATE TYPE transaction_type AS ENUM (
    'CREDIT_PURCHASE',
    'CREDIT_SPEND',
    'COMMISSION_EARNED',
    'PLATFORM_FEE',
    'REFUND'
);

-- Transaction status enum
CREATE TYPE transaction_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);
```

### API Implementation
```typescript
// New service: financialTrackingService.ts
interface FinancialSummary {
    totalRevenue: number;
    creditsPurchased: number;
    creditsSpent: number;
    platformFees: number;
    commissions: number;
}

interface TransactionFilters {
    userId?: string;
    type?: TransactionType;
    startDate?: Date;
    endDate?: Date;
    status?: TransactionStatus;
}

class FinancialTrackingService {
    getFinancialSummary(dateRange?: DateRange): Promise<FinancialSummary>;
    getUserTransactions(filters: TransactionFilters): Promise<Transaction[]>;
    getLadyEarnings(ladyId: string, dateRange?: DateRange): Promise<EarningsSummary>;
    getClubRevenue(clubId: string, dateRange?: DateRange): Promise<RevenueSummary>;
    getPlatformMetrics(dateRange?: DateRange): Promise<PlatformMetrics>;
}
```

## Implementation Phases

### Phase 1: Account Management (2 weeks)
1. Database schema updates for account locking
2. Admin UI for user management
3. API endpoints for lock/unlock
4. Integration testing

### Phase 2: Content Moderation (3 weeks)
1. Media management implementation
2. Comment moderation system
3. Review management features
4. Content filtering integration
5. Moderation audit logging

### Phase 3: Financial Tracking (3 weeks)
1. Database schema updates
2. Financial tracking service implementation
3. Admin dashboard UI
4. Report generation
5. Analytics integration

## Security Considerations

1. **Access Control**
   - Strict role-based access for admin features
   - Audit logging for all moderation actions
   - Two-factor authentication for sensitive operations

2. **Data Protection**
   - Encrypted storage for sensitive data
   - Compliance with data protection regulations
   - Regular security audits

3. **Backup and Recovery**
   - Regular backups of moderation data
   - Recovery procedures for accidental deletions
   - Version history for content changes

## Monitoring and Metrics

1. **Moderation Metrics**
   - Number of locked accounts
   - Content removal statistics
   - Response time to reports
   - Moderation action effectiveness

2. **Financial Metrics**
   - Revenue tracking
   - Transaction success rates
   - Platform growth indicators
   - User spending patterns

## Next Steps

1. Review and approve implementation plan
2. Set up project milestones
3. Assign development resources
4. Begin Phase 1 implementation
5. Regular progress reviews and adjustments

---

This implementation plan provides a comprehensive framework for enhancing the platform's admin moderation capabilities. Each phase can be implemented independently while maintaining system stability. 