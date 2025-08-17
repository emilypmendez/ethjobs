-- Migration: Fix profiles table for Web3 wallet authentication
-- This migration updates the profiles table to work with wallet addresses instead of Supabase Auth

-- Step 1: Add the available_start_date column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS available_start_date DATE;

-- Step 2: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 3: Remove the foreign key constraint to auth.users if it exists
-- Note: This will only work if there are no existing profiles
-- If you have existing data, you may need to handle this differently
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 4: Modify the id column to use UUID generation instead of auth reference
-- Note: This is a destructive operation - backup your data first!
-- ALTER TABLE profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Step 5: Make wallet_address required
ALTER TABLE profiles
ALTER COLUMN wallet_address SET NOT NULL;

-- Step 6: Create new RLS policies for Web3 wallet authentication
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update profiles" ON profiles
  FOR UPDATE USING (true);

-- Step 7: Add comments
COMMENT ON COLUMN profiles.available_start_date IS 'The date when the user is available to start new projects';
COMMENT ON COLUMN profiles.wallet_address IS 'The Web3 wallet address of the user (required for authentication)';
