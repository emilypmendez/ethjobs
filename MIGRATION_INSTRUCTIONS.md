# Database Migration Required

## Errors You May Be Seeing
1. "Could not find the 'available_start_date' column of 'profiles' in the schema cache"
2. "new row violates row-level security policy for table 'profiles'"

## Root Cause
The database schema was set up for Supabase Auth users, but we're using Web3 wallet authentication. We need to update the database to work with wallet addresses.

## Solution Options

### Option 1: Quick Fix (Recommended for Development)
If you don't have important data and want to start fresh:

1. **Drop the existing profiles table:**
```sql
DROP TABLE IF EXISTS profiles CASCADE;
```

2. **Recreate with the updated schema:**
```sql
-- Create profiles table for Web3 wallet authentication
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
  location TEXT,
  remote_preference BOOLEAN DEFAULT true,
  available_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for Web3 authentication
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update profiles" ON profiles
  FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX idx_profiles_wallet_address ON profiles(wallet_address);

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Option 2: Migration (If You Have Existing Data)
If you have existing profiles data you want to keep:

1. **Run the migration script** (see `src/lib/migrations/add_available_start_date.sql`)
2. **Note:** This is more complex and may require manual data handling

### Step 3: Verify the Migration
After running the SQL, verify it worked:

```sql
-- Check the table structure
\d profiles;

-- Or check specific column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'available_start_date';
```

### Step 4: Restart Your Application
```bash
npm run dev
```

## What Changed
- **Database Schema**: Profiles table now uses generated UUIDs instead of auth.users references
- **RLS Policies**: Updated to allow Web3 wallet-based authentication
- **Profile Creation**: Now works with wallet addresses directly
- **New Column**: Added `available_start_date` for user availability

## Files Updated
- `src/lib/supabase-schema.sql` - Complete updated schema
- `src/lib/database.types.ts` - TypeScript types
- `src/lib/profile.ts` - Profile creation functions
- `src/lib/migrations/add_available_start_date.sql` - Migration script
