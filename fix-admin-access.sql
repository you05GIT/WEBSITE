-- ============================================
-- FIX: Auto-create user_profiles for auth.users
-- This trigger ensures that when a user is created in auth.users,
-- a corresponding user_profiles record is automatically created
-- ============================================

-- Function to handle new user creation
-- This runs with SECURITY DEFINER to allow inserting into user_profiles
-- Only triggered automatically by auth.users INSERT operations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if it doesn't already exist
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (id) DO NOTHING;
  
  -- Log for audit purposes (optional, comment out if not needed)
  -- RAISE NOTICE 'Created user_profile for user: %', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- HELPER: Set a user as admin
-- Usage: SELECT set_user_as_admin('user-email@example.com');
-- SECURITY: This function should only be accessible to authenticated users
--           In production, consider restricting via RLS or database roles
-- ============================================
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Validate input
  IF user_email IS NULL OR user_email = '' THEN
    RAISE EXCEPTION 'Email cannot be empty';
  END IF;
  
  -- Get user ID from auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert or update user_profiles
  INSERT INTO public.user_profiles (id, role)
  VALUES (user_id, 'admin')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin', updated_at = NOW();
  
  RAISE NOTICE 'User % (%) set as admin', user_email, user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission only to authenticated users
-- Uncomment in production and adjust as needed:
-- REVOKE EXECUTE ON FUNCTION public.set_user_as_admin(TEXT) FROM PUBLIC;
-- GRANT EXECUTE ON FUNCTION public.set_user_as_admin(TEXT) TO authenticated;

-- ============================================
-- Example usage (uncomment and update email):
-- SELECT set_user_as_admin('admin@example.com');
-- ============================================
