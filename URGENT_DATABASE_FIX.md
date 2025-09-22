# URGENT: Database Migration Required

## Problem
The "Active" checkbox is not working because the `active` column doesn't exist in your events table. The error shows: "column events.active does not exist"

## Solution - Apply Database Migration Manually

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Login to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"

### Step 3: Run This SQL Command
Copy and paste this exact SQL and run it:

```sql
-- Add active column to events table
ALTER TABLE events 
ADD COLUMN active BOOLEAN DEFAULT true;

-- Update existing events to be active by default
UPDATE events SET active = true WHERE active IS NULL;

-- Add comment to the column
COMMENT ON COLUMN events.active IS 'Determines if the event is active and should be displayed on the public events page';
```

### Step 4: Verify the Migration
Run this query to confirm the column was added:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'active';
```

You should see the `active` column listed.

### Step 5: Test the Checkbox
1. Go back to http://localhost:4322/admin/events
2. Try toggling the "Active" checkbox on any event
3. It should now work without errors

## Why This Happened
The migration SQL file exists but was never applied to your actual database. The Supabase CLI isn't linked to your project, so we need to apply it manually through the dashboard.

## After Fixing
Once you've applied this migration, I'll help you make the events clickable on the events page so users can view event details and photos.