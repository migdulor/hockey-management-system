-- Migration: Remove plan-based team validation and use max_teams field
-- This removes the plan system and uses the max_teams field directly

-- 1. Drop the existing trigger and function
DROP TRIGGER IF EXISTS validate_team_limit_trigger ON teams;
DROP FUNCTION IF EXISTS validate_team_limit_by_plan();

-- 2. Create new function that uses max_teams field directly
CREATE OR REPLACE FUNCTION validate_team_limit_by_max_teams()
RETURNS TRIGGER AS $$
DECLARE
    user_max_teams INTEGER;
    current_team_count INTEGER;
BEGIN
    -- Get max_teams from users table
    SELECT max_teams INTO user_max_teams FROM users WHERE id = NEW.user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found with id: %', NEW.user_id;
    END IF;
    
    -- Use default if max_teams is NULL
    IF user_max_teams IS NULL THEN
        user_max_teams := 2; -- Conservative default
    END IF;
    
    -- Count current active teams for the user
    SELECT COUNT(*) INTO current_team_count 
    FROM teams 
    WHERE user_id = NEW.user_id AND is_active = true;
    
    -- Validate limit (if INSERT, add 1 to count)
    IF TG_OP = 'INSERT' THEN
        IF current_team_count >= user_max_teams THEN
            RAISE EXCEPTION 'User allows maximum % teams. Current active teams: %', 
                user_max_teams, current_team_count;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If reactivating an inactive team
        IF OLD.is_active = false AND NEW.is_active = true THEN
            IF current_team_count >= user_max_teams THEN
                RAISE EXCEPTION 'User allows maximum % teams. Current active teams: %', 
                    user_max_teams, current_team_count;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create new trigger using the max_teams function
CREATE TRIGGER validate_team_limit_max_teams_trigger
    BEFORE INSERT OR UPDATE ON teams
    FOR EACH ROW 
    EXECUTE FUNCTION validate_team_limit_by_max_teams();

-- 4. Update any users that still have plan fields to have proper max_teams values
UPDATE users 
SET max_teams = CASE 
    WHEN plan = '2_teams' THEN 2
    WHEN plan = '3_teams' THEN 3
    WHEN plan = '5_teams' THEN 5
    ELSE COALESCE(max_teams, 2)
END
WHERE max_teams IS NULL OR max_teams = 0;

-- 5. Remove plan column (optional - can be done later if needed)
-- ALTER TABLE users DROP COLUMN IF EXISTS plan;
