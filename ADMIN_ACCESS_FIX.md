# Admin Access Fix

## Problem
Admin users cannot access the admin panel because:
1. No automatic `user_profiles` record creation when users are created in Supabase Auth
2. Admin authentication requires a `user_profiles` entry with `role='admin'`
3. Without the profile, admin login fails

## Solution

### Step 1: Apply the Database Migration

Run the SQL migration in your Supabase SQL Editor:

```bash
# The migration file is: fix-admin-access.sql
```

This migration adds:
1. A trigger to auto-create `user_profiles` for new users
2. A helper function to easily set users as admin

### Step 2: Create Your Admin User

Option A: Create a new admin user
```sql
-- 1. Create user in Supabase Auth UI (Authentication > Users > Add User)
--    Email: admin@example.com
--    Password: your-secure-password

-- 2. Then run this SQL to make them admin:
SELECT set_user_as_admin('admin@example.com');
```

Option B: Convert existing user to admin
```sql
-- If you already have a user account, just run:
SELECT set_user_as_admin('existing-user@example.com');
```

Option C: Manual SQL
```sql
-- Get the user ID from auth.users first
SELECT id, email FROM auth.users;

-- Then insert/update the profile
INSERT INTO public.user_profiles (id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (id) 
DO UPDATE SET role = 'admin', updated_at = NOW();
```

### Step 3: Test Admin Login

1. Navigate to `/admin/login`
2. Enter admin credentials
3. You should be redirected to `/admin` dashboard

## Verification

Check if admin profile exists:
```sql
SELECT u.email, up.role, up.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id
WHERE up.role = 'admin';
```

## Changes Made

### Code Changes:
1. **`/app/admin/login/page.tsx`**: Added better error handling and logging
2. **`/app/admin/layout.tsx`**: Improved auth check with detailed logging

### Database Changes:
1. **`fix-admin-access.sql`**: Trigger for auto-creating user profiles and helper function

## Removing Debug Logs

After confirming admin access works, remove console.log statements from:
- `/app/admin/login/page.tsx` (lines with console.log)
- `/app/admin/layout.tsx` (lines with console.log)

## Security Notes

- Admin profiles are NOT auto-created as 'admin' role
- New users default to 'customer' role
- Admin role must be explicitly set via SQL or helper function
- This maintains security while fixing the access issue
