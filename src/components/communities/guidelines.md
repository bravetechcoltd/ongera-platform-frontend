# Admin Community Management System - Implementation Guide

## Overview
This system enables admins to review, approve, reject, and manage communities before they become publicly visible.

## Backend Implementation

### 1. Database Changes
Ensure your Community model has the `is_active` field (already present):
```typescript
@Column({ default: true })
is_active: boolean;
```

### 2. Update Routes (communityRoutes.ts)
```typescript
// Add admin routes BEFORE the dynamic :id route
router.get("/admin/all", authenticate, requireAdmin, CommunityController.getAllCommunitiesForAdmin);
router.get("/admin/pending", authenticate, requireAdmin, CommunityController.getPendingCommunities);
router.patch("/admin/:id/approve", authenticate, requireAdmin, CommunityController.approveCommunity);
router.delete("/admin/:id/reject", authenticate, requireAdmin, CommunityController.rejectCommunity);
router.delete("/admin/:id", authenticate, requireAdmin, CommunityController.deleteCommunity);
```

### 3. Environment Variables
Add to your `.env` file:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Your Platform <noreply@yourplatform.com>"
ADMIN_EMAIL=admin@yourplatform.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Install Dependencies
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Frontend Implementation

### 1. Update Redux Store
Add the enhanced communitiesSlice with admin functions to your store configuration.

### 2. Create Admin Route
Create the file: `app/dashboard/admin/communities/page.tsx`

### 3. Protect Admin Routes
Add middleware to check for admin role:
```typescript
// middleware.ts or admin layout
if (user?.account_type !== 'admin') {
  redirect('/dashboard')
}
```

### 4. Update Navigation
Add admin menu item for users with admin role:
```tsx
{user?.account_type === 'admin' && (
  <Link href="/dashboard/admin/communities">
    <Shield className="w-5 h-5" />
    <span>Manage Communities</span>
  </Link>
)}
```

## Features Included

### ✅ Backend Features
- **Community Creation**: Users submit communities (set to `is_active: false`)
- **Admin Endpoints**: Separate endpoints for admin operations
- **Email Notifications**: Automatic emails on approval/rejection
- **Filtering**: Filter by status, category, search
- **Pagination**: Handle large datasets efficiently

### ✅ Frontend Features
- **Admin Dashboard**: Comprehensive management interface
- **Status Filtering**: View all, pending, or approved communities
- **Search & Filter**: Find communities quickly
- **Quick Actions**: Approve/reject with one click
- **Detail Modal**: View full community information
- **Data Export**: Export communities to CSV/JSON
- **Statistics Cards**: Visual overview of community stats
- **Responsive Design**: Works on all devices

## Testing the Implementation

### 1. Create Test Admin User
Update a user in your database:
```sql
UPDATE users 
SET account_type = 'admin' 
WHERE email = 'your-admin@email.com';
```

### 2. Test Flow
1. **Create Community** (as regular user)
   - Should be created with `is_active: false`
   - Admin receives email notification
   
2. **Admin Reviews** (as admin user)
   - Navigate to `/dashboard/admin/communities`
   - See pending community in list
   - Click approve or reject
   
3. **Approval Flow**
   - Community becomes visible to all users
   - Creator receives approval email
   - Community appears in public listings

4. **Rejection Flow**
   - Community is deleted
   - Creator receives rejection email with reason
   - Community removed from all listings

## API Endpoints Reference

### Public Endpoints
- `GET /api/communities` - List approved communities only
- `GET /api/communities/:id` - Get community details

### Authenticated Endpoints
- `POST /api/communities` - Create community (pending)
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community
- `GET /api/communities/my-communities` - User's communities

### Admin Endpoints
- `GET /api/communities/admin/all` - All communities (pending + approved)
- `GET /api/communities/admin/pending` - Pending communities only
- `PATCH /api/communities/admin/:id/approve` - Approve community
- `DELETE /api/communities/admin/:id/reject` - Reject community
- `DELETE /api/communities/admin/:id` - Delete community

## Customization Options

### 1. Auto-Approval for Trusted Users
```typescript
// In createCommunity controller
const trustedAccountTypes = ['Institution', 'Researcher'];
const isAutoApproved = trustedAccountTypes.includes(req.user.account_type);

community.is_active = isAutoApproved;
```

### 2. Multiple Admin Roles
```typescript
// In requireAdmin middleware
const adminRoles = ['admin', 'moderator', 'super_admin'];
if (!adminRoles.includes(req.user.account_type)) {
  return res.status(403).json({ message: "Admin access required" });
}
```

### 3. Approval Workflow
Add approval stages:
```typescript
enum ApprovalStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
```

## Security Considerations

1. **Admin Authentication**: Always verify admin role server-side
2. **Rate Limiting**: Implement rate limits on community creation
3. **Input Validation**: Sanitize all user inputs
4. **Email Verification**: Consider requiring verified emails for community creators
5. **Audit Logs**: Log all admin actions for accountability

## Performance Tips

1. **Pagination**: Always use pagination for large datasets
2. **Indexing**: Add database indexes on `is_active`, `created_at`
3. **Caching**: Cache approved communities list
4. **Image Optimization**: Compress cover images before upload

## Troubleshooting

### Communities not showing in admin panel
- Check user has `account_type = 'admin'`
- Verify authentication token includes account_type
- Check API endpoint URLs match routes

### Email notifications not working
- Verify SMTP credentials in `.env`
- Check firewall/security settings
- Test with a simple nodemailer test script

### Approval not working
- Check admin middleware is properly configured
- Verify database connection and permissions
- Check console logs for errors

## Next Steps

1. **Analytics Dashboard**: Add community growth metrics
2. **Batch Operations**: Select and approve/reject multiple communities
3. **Activity Logs**: Track all admin actions
4. **Advanced Filters**: Filter by date range, creator type, etc.
5. **Community Tags**: Add tagging system for better organization

## Support

For issues or questions:
1. Check console logs (backend and frontend)
2. Verify database schema matches models
3. Test API endpoints with Postman
4. Review error messages carefully

---

**Note**: Always test in development before deploying to production!