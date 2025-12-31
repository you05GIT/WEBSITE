-- ============================================
-- FIX: Auto-create user_profiles for auth.users
-- This trigger ensures that when a user is created in auth.users,
-- a corresponding user_profiles record is automatically created
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (id) DO NOTHING;
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
-- ============================================
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
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
  
  RAISE NOTICE 'User % set as admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Example usage (uncomment and update email):
-- SELECT set_user_as_admin('admin@example.com');
-- ============================================
