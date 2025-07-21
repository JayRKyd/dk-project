# Client Platform Requirements & Functionality Notes

## Lady Registration & Verification Process

### New Lady Account Creation
- When creating a new account as a LADY, users can directly enter the Dashboard
- As a NEW Lady, the first step should be to go to the **Verify page** to add:
  - Photo (selfie)
  - Newspaper photo
- Once profile is verified by Admin, Lady can access the full Dashboard with all functionalities

### Lady Verification Requirements (MANDATORY)
- Ladies must upload **4 documents** before getting Dashboard access
- Required documents include:
  - ID card
  - Selfie verification
  - Additional verification photos
- This prevents Men/Clients from creating fake Lady accounts
- Verification is processed by Admin approval

## Admin Dashboard Requirements

### Admin Dashboard Functionality
**Question: What should the Admin Dashboard include?**
- View new users
- Approve user accounts
- Verify user profiles
- Block/unblock users
- Manage user permissions
- Process verification documents

## User Profile & Account Issues

### Profile Name Display Issue
- **Problem**: Account takes the full email name instead of the chosen signup name
- **Fix Needed**: Display the user's chosen name from registration, not email

### Missing Account Access
- **Problem**: No account/profile button on website for quick Dashboard access
- **Current State**: Only Logout button available
- **Fix Needed**: Add account/profile button for easy Dashboard navigation

## Client Interaction with FREE Ladies

### Interaction Limitations
- **No Direct Chat System**: Platform doesn't support internal messaging
- Users prefer to move to WhatsApp for communication
- Ladies are working and want to earn money, not waste time on free chat

### Available Interactions
1. **Fan Post Comments**: When Clients purchase Fan Posts, they can leave comments and Ladies can reply
2. **Gift Comments**: When Clients send GIFTS, they can leave comments and Ladies can reply  
3. **Review Replies**: When Clients leave Reviews, Ladies can reply

### FREE Lady Profile Recognition
- Clients can identify FREE profiles by limited functionalities
- FREE ladies cannot post/sell Fan Posts
- This helps Clients understand the profile type without explicit labeling

## Content Preview Strategy for FREE Users

### Teaser Approach
- FREE users should see what they're missing with PRO/ULTRA features
- In Dashboard, PRO and ULTRA features should be grayed out/inactive
- Examples:
  - FREE Lady sees Fan Posts option but cannot create them (PRO/ULTRA required)
  - FREE Lady sees received GIFTS but cannot collect them (PRO/ULTRA required)

### Upgrade Prompts
- Upgrade prompts are acceptable but should not be pushy or "in your face"
- Provide clear Upgrade Membership option in Dashboard
- Make upgrade process easy and accessible

## Membership Tier Visibility

### Client-Facing Visibility
- Membership tiers should **NOT** be highly visible to Clients
- Remove FREE/PRO badges from Advertisements (were only for developer reference)
- Clients don't need to see directly if advertisement is FREE or PRO
- Clients can naturally guess:
  - TOP advertisements are likely ULTRA
  - Profiles with limited functionality are likely FREE

### Search Functionality
- **No membership tier filters** in search
- **DO include Fan Posts search filter** - lets Clients guess which profiles aren't FREE
- This indirect approach maintains tier privacy while providing functionality

## Advertisement Sorting & Priority

### Display Order Priority
1. **ULTRA** - Always on top
2. **PRO / PRO-Plus** - Second priority
3. **FREE** - Third priority
4. **Geographic Expansion** - Dynamic searching outside primary location
   - Example: 5km outside London → 20km outside London → expanding further

## Club Verification Requirements

### Club Verification Process (MANDATORY)
- Higher barrier to entry for better quality control
- Personal touch approach - maintain contact with clubs post-verification
- Provide ongoing support for profile optimization and questions

### Club Verification Documents
- **Different from Ladies**: Clubs don't need ID card or selfie uploads
- Required information:
  - Contact number
  - Website URL
  - Business verification documents

### Club Verification Method
- Contact club owner directly to verify authenticity
- Require proof of ownership:
  - Official business documentation
  - Email from company email address
  - Phone verification with business owner

## Platform Communication Philosophy

### No Internal Chat System
- Deliberate decision to avoid internal messaging
- Users prefer external communication (WhatsApp)
- Focus on revenue-generating interactions rather than free chat
- Ladies prioritize earning money over time-consuming conversations

### Interaction Types
- **Transactional**: Fan Post purchases with comments
- **Gift-based**: Gift sending with messages
- **Review-based**: Review responses and replies
- **External**: Move to WhatsApp for extended communication

## Key Implementation Priorities

1. **Fix profile name display** (use chosen name, not email)
2. **Add account/profile access button** to header/navigation
3. **Implement Admin Dashboard** with user management features
4. **Complete Lady verification flow** with document upload
5. **Implement Club verification process** with business validation
6. **Gray out PRO/ULTRA features** for FREE users with upgrade prompts
7. **Remove membership tier badges** from client-facing advertisements
8. **Add Fan Posts search filter** (indirect tier indication)
9. **Implement advertisement sorting** by membership tier priority 