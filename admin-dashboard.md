# Admin Dashboard Requirements & Specifications

**Created**: January 2025  
**Purpose**: Central documentation for admin verification system and dashboard functionality  
**Status**: Implementation Planning Phase

---

## 🎯 **Admin Dashboard Overview**

The admin dashboard is the central control system for managing user verifications, approvals, and platform oversight. Admins have the authority to approve/reject user accounts and manage platform integrity.

---

## 👥 **User Verification Systems**

### **🌸 Lady Verification Process**

#### **Mandatory 4-Document Verification:**
Based on client verification flow, ladies must upload exactly 4 documents:

1. **📄 ID Card Photo**
   - **Requirement**: "A photo of your ID card / Passport or Drivers License"
   - **Purpose**: Identity verification
   - **Database Type**: `id_card`

2. **🤳 Selfie with ID**
   - **Requirement**: "A photo of you holding your ID card"
   - **Purpose**: Verify person matches ID
   - **Database Type**: `selfie_with_id`

3. **📰 Newspaper Photo**
   - **Requirement**: "A photo of you holding a newspaper of the country where you advertise so we know you are in that country. Make sure we can read the date of the newspaper"
   - **Purpose**: Location and date verification
   - **Database Type**: `newspaper_photo`

4. **📸 Upper Body Selfie**
   - **Requirement**: "A clear photo/selfie of you and upper body"
   - **Purpose**: Profile photo verification
   - **Database Type**: `upper_body_selfie`

#### **Business Rules:**
- ✅ **Mandatory Verification**: "It's mandatory to verify your account on DateKelly"
- ✅ **Age Requirement**: Must be 18+ years old (image shows 18-21 but likely 18+ generally)
- ✅ **Trust Building**: Verified accounts receive 175% more client interest
- ✅ **Premium Access**: Verified ladies can post "Premium Pictures" and earn DateKelly credits
- ✅ **Verified Badge**: Displays trusted "Verified!" icon in advertisements

### **🏢 Club Verification Process**

#### **4-Document Business Verification:**
1. **📋 Business License** (`license`)
2. **📝 Registration Documents** (`registration`) 
3. **🆔 Tax ID** (`tax_id`)
4. **📷 Business Photo** (`photo`)

#### **Status Tracking:**
- Default status: `pending`
- Options: `pending`, `verified`, `rejected`

---

## 🖥️ **Admin Dashboard Interface Requirements**

### **📊 Main Dashboard View**
- **Verification Queue Count**: Show pending verifications by type
- **Recent Activity**: Latest verification submissions
- **Statistics**: Total users, verified vs unverified counts
- **Quick Actions**: Bulk approve/reject options

### **👤 User Management Section**

#### **Lady Verification Panel:**
```
┌─ Lady Verification Queue ─────────────────┐
│ Name: [Lady Name]                         │
│ Email: [email@example.com]                │
│ Submitted: [2025-01-15 14:30]            │
│ Status: [2/4 Documents Uploaded]          │
│                                           │
│ Documents:                                │
│ ✅ ID Card Photo        [View] [Approve]  │
│ ✅ Selfie with ID       [View] [Approve]  │
│ ⏳ Newspaper Photo      [Pending]         │
│ ⏳ Upper Body Selfie    [Pending]         │
│                                           │
│ [Approve All] [Reject All] [Add Notes]    │
└───────────────────────────────────────────┘
```

#### **Club Verification Panel:**
```
┌─ Club Verification Queue ─────────────────┐
│ Club: [Club Name]                         │
│ Email: [club@example.com]                 │
│ Submitted: [2025-01-15 14:30]            │
│ Status: [4/4 Documents Uploaded]          │
│                                           │
│ Documents:                                │
│ ✅ Business License     [View] [Approve]  │
│ ✅ Registration         [View] [Approve]  │
│ ✅ Tax ID               [View] [Approve]  │
│ ✅ Business Photo       [View] [Approve]  │
│                                           │
│ [Approve All] [Reject All] [Add Notes]    │
└───────────────────────────────────────────┘
```

### **🔍 Document Review Interface**
- **Image Viewer**: Large, clear view of uploaded documents
- **Zoom Functionality**: Ability to zoom in on details
- **Side-by-side Comparison**: Compare ID with selfie
- **Rejection Reasons**: Dropdown with common rejection reasons
- **Admin Notes**: Free text field for additional comments

### **📈 Analytics & Reporting**
- **Verification Metrics**: Success rates, average processing time
- **User Growth**: New registrations vs verifications
- **Document Quality**: Most common rejection reasons
- **Admin Performance**: Processing times per admin

---

## 🗄️ **Database Schema Requirements**

### **Lady Verification Documents Table:**
```sql
CREATE TABLE lady_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lady_id UUID REFERENCES users(id),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'id_card',           -- Photo of ID/Passport/License
    'selfie_with_id',    -- Photo holding ID card  
    'newspaper_photo',   -- Photo with newspaper (location proof)
    'upper_body_selfie'  -- Clear selfie/upper body photo
  )),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'success', 'error')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_id UUID REFERENCES users(id), -- Who approved/rejected
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### **Enhanced Users Table:**
```sql
-- Additional columns needed:
ALTER TABLE users ADD COLUMN verification_submitted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN verification_notes TEXT;
ALTER TABLE users ADD COLUMN can_post_premium BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN verified_by_admin UUID REFERENCES users(id);
```

### **Admin Actions Log:**
```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL, -- 'approve_user', 'reject_user', 'approve_document', etc.
  target_user_id UUID REFERENCES users(id),
  target_document_id UUID, -- Could reference either lady or club verification docs
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### **Verification Queue View:**
```sql
CREATE VIEW verification_queue AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.role,
  u.created_at as registered_at,
  u.verification_submitted_at,
  u.is_verified,
  COUNT(CASE WHEN lvd.verification_status = 'pending' THEN 1 END) as pending_documents,
  COUNT(lvd.id) as total_documents_uploaded,
  CASE 
    WHEN u.role = 'lady' THEN 4
    WHEN u.role = 'club' THEN 4
    ELSE 0
  END as required_documents
FROM users u
LEFT JOIN lady_verification_documents lvd ON u.id = lvd.lady_id
WHERE u.role IN ('lady', 'club') 
  AND u.is_verified = false
GROUP BY u.id, u.username, u.email, u.role, u.created_at, u.verification_submitted_at, u.is_verified;
```

---

## 🔐 **Admin Access Control**

### **Admin Role Requirements:**
- **Role**: `admin` in users table
- **Permissions**: Full access to verification system
- **Authentication**: Must be logged in with admin role

### **Admin Dashboard Routes:**
- `/admin` - Main dashboard
- `/admin/verifications` - Verification queue
- `/admin/users` - User management
- `/admin/analytics` - Platform analytics
- `/admin/settings` - System settings

---

## ⚡ **Workflow Process**

### **Lady Verification Workflow:**
1. **Registration** → Lady creates account
2. **Redirect** → Automatically redirected to `/verification` page
3. **Upload** → Must upload all 4 required documents
4. **Submission** → Sets `verification_submitted_at` timestamp
5. **Admin Review** → Appears in admin verification queue
6. **Decision** → Admin approves/rejects individual documents or entire set
7. **Notification** → Lady receives approval/rejection notification
8. **Access** → If approved, gains full dashboard access + premium features

### **Club Verification Workflow:**
1. **Registration** → Club creates account  
2. **Redirect** → Automatically redirected to `/club-verification` page
3. **Upload** → Must upload all 4 required business documents
4. **Submission** → Sets `verification_submitted_at` timestamp
5. **Admin Review** → Appears in admin verification queue
6. **Decision** → Admin approves/rejects documents
7. **Notification** → Club receives approval/rejection notification
8. **Access** → If approved, gains full club dashboard access

---

## 🚨 **Critical Implementation Notes**

### **Mandatory Verification Enforcement:**
- Ladies **CANNOT** access full dashboard until verified
- Clubs **CANNOT** access full dashboard until verified
- Verification page should be the **ONLY** accessible page after registration
- Must implement verification guards on all protected routes

### **Document Quality Standards:**
- Clear, readable images
- Proper lighting and focus
- No blurred or obscured text
- ID documents must be valid and not expired
- Newspaper must show readable date and location

### **Admin Efficiency Features:**
- Batch processing capabilities
- Quick approve/reject buttons
- Document quality indicators
- Search and filter functionality
- Keyboard shortcuts for common actions

---

## 📋 **Future Enhancements**

### **Automated Verification:**
- AI-powered document validation
- Automatic quality checks
- Fraud detection algorithms

### **Advanced Analytics:**
- Verification success patterns
- Document rejection analysis
- Admin performance metrics
- User behavior insights

### **Communication System:**
- In-app messaging for verification issues
- Email notifications for status changes
- SMS alerts for urgent verifications

---

**Last Updated**: January 2025  
**Next Review**: After Phase 1.2 Implementation 