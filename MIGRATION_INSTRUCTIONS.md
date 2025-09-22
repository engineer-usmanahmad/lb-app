# Manual Database Migration Instructions

## Issue
The "Active" checkbox is not working because the `active` column doesn't exist in the events table.

## Solution
You need to manually apply the SQL migration through your Supabase Dashboard.

## Steps to Fix

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration SQL**
   Copy and paste the following SQL into the editor and click "Run":

```sql
-- Add active column to events table
-- This allows events to be marked as active/inactive for display control

ALTER TABLE events 
ADD COLUMN active BOOLEAN DEFAULT true;

-- Update existing events to be active by default
UPDATE events SET active = true WHERE active IS NULL;

-- Add comment to the column
COMMENT ON COLUMN events.active IS 'Determines if the event is active and should be displayed on the public events page';
```

4. **Verify the Migration**
   - Go to "Table Editor" in the left sidebar
   - Select the "events" table
   - You should now see the new "active" column with a default value of `true`

5. **Test the Active Checkbox**
   - Go back to your admin events page: http://localhost:4322/admin/events
   - Try toggling the "Active" checkbox for the "AWS & DevOps Seminar" event
   - The checkbox should now work without errors

## What This Migration Does
- Adds a new `active` boolean column to the events table
- Sets the default value to `true` for all new events
- Updates any existing events to be active by default
- Adds a helpful comment explaining the column's purpose

After running this migration, the active checkbox functionality will work properly, and you'll be able to control which events are displayed on the public events page.