-- Add active column to events table
-- This allows events to be marked as active/inactive for display control

ALTER TABLE events 
ADD COLUMN active BOOLEAN DEFAULT true;

-- Update existing events to be active by default
UPDATE events SET active = true WHERE active IS NULL;

-- Add comment to the column
COMMENT ON COLUMN events.active IS 'Determines if the event is active and should be displayed on the public events page';