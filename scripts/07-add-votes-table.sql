-- Create the votes table
CREATE TABLE IF NOT EXISTS report_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (report_id, user_id) -- Ensure a user can only vote once per report
);

-- Create a function to increment report votes
CREATE OR REPLACE FUNCTION increment_report_votes(p_report_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE reports
    SET votes = votes + 1
    WHERE id = p_report_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to decrement report votes (if needed for unvoting)
CREATE OR REPLACE FUNCTION decrement_report_votes(p_report_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE reports
    SET votes = votes - 1
    WHERE id = p_report_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote count on reports table
-- This trigger will call the increment_report_votes function after an insert
-- and the decrement_report_votes function after a delete on report_votes.
CREATE OR REPLACE FUNCTION update_report_votes_count_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_report_votes(NEW.report_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM decrement_report_votes(OLD.report_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to prevent duplicates
DROP TRIGGER IF EXISTS update_votes_count_trigger ON report_votes;

-- Create the trigger
CREATE TRIGGER update_votes_count_trigger
AFTER INSERT OR DELETE ON report_votes
FOR EACH ROW
EXECUTE FUNCTION update_report_votes_count_trigger_function();
