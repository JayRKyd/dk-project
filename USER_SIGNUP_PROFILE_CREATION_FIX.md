# User Signup Profile Creation Fix

## Issue Description

When users tried to sign up (especially with role 'lady'), they encountered a **"Database error saving new user"** error with HTTP 500 status. The signup process was failing during the profile creation step.

## Root Cause Analysis

The issue was traced to the `handle_new_user_profile()` trigger function that runs after a new user is created in the `users` table. The function was failing with the error: **"relation 'profiles' does not exist"**.

### Technical Details

1. **Trigger Chain**: 
   - User signs up → `auth.users` record created → `on_user_created_profile` trigger fires
   - Trigger calls `handle_new_user_profile()` function
   - Function attempts to insert into `profiles` table

2. **Primary Issues**:
   - **Schema Path Issue**: The function wasn't explicitly referencing `public.profiles`
   - **RLS Policy Conflicts**: Row Level Security policies were blocking the insert operation during signup

3. **Error Sequence**:
   ```
   POST /auth/v1/signup → 500 Internal Server Error
   AuthApiError: Database error saving new user
   PostgreSQL Error: relation "profiles" does not exist
   ```

## Solution Implemented

### Migration: `fix_profile_creation_schema_reference`

Updated the `handle_new_user_profile()` function to:

1. **Explicit Schema Reference**: Changed `INSERT INTO profiles` to `INSERT INTO public.profiles`
2. **RLS Bypass**: Added temporary RLS disable/enable around the insert operation
3. **SECURITY DEFINER**: Maintained function security context

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Temporarily disable RLS for this operation
  PERFORM set_config('row_security', 'off', true);
  
  -- Create a profile for the new user with explicit schema reference
  INSERT INTO public.profiles (user_id, name, location, description, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.username, split_part(NEW.email, '@', 1)),
    'Location not specified',
    'No description provided',
    NOW(),
    NOW()
  );
  
  -- Re-enable RLS
  PERFORM set_config('row_security', 'on', true);
  
  RETURN NEW;
END;
$function$;
```

## Why This Fix Works

1. **Schema Qualification**: `public.profiles` ensures the function finds the correct table regardless of search path
2. **RLS Bypass**: Temporarily disabling RLS allows the system function to create profiles during signup
3. **Security Context**: `SECURITY DEFINER` ensures the function runs with appropriate privileges

## Testing

- ✅ Lady role signup now works successfully
- ✅ Profile record is created automatically
- ✅ No more "Database error saving new user" errors

## Related Files

- `src/contexts/AuthContext.tsx` - Signup logic
- `src/pages/Register.tsx` - Registration form
- Database trigger: `on_user_created_profile`
- Database function: `handle_new_user_profile()`

## Prevention

For future database functions that interact with tables:
1. Always use explicit schema qualification (`public.table_name`)
2. Consider RLS policy impacts on system functions
3. Test signup/registration flows thoroughly after database changes
4. Monitor PostgreSQL logs for relation/permission errors

## Date Fixed
January 6, 2025 