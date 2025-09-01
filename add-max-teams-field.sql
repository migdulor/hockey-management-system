-- Migration: Add max_teams field to users table
-- Date: 2025-01-02
-- Description: Add a new INTEGER field max_teams (0-10) to replace plan field constraints for team counting

-- Step 1: Add the new max_teams column with proper constraints
ALTER TABLE users ADD COLUMN max_teams INTEGER DEFAULT 2 CHECK (max_teams >= 0 AND max_teams <= 10);

-- Step 2: Migrate existing data from plan field to max_teams field
UPDATE users 
SET max_teams = CASE 
    WHEN plan = '1_teams' THEN 1
    WHEN plan = '2_teams' THEN 2
    WHEN plan = '3_teams' THEN 3
    WHEN plan = '5_teams' THEN 5
    ELSE 2  -- Default fallback
END;

-- Step 3: Verify the migration
SELECT 
    id, 
    email, 
    plan, 
    max_teams,
    CASE 
        WHEN max_teams IS NULL THEN 'ERROR: max_teams is NULL'
        WHEN max_teams < 0 OR max_teams > 10 THEN 'ERROR: max_teams out of range'
        ELSE 'OK'
    END as validation_status
FROM users 
ORDER BY id;

-- Step 4: Check constraint validation
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN max_teams IS NOT NULL THEN 1 END) as users_with_max_teams,
    MIN(max_teams) as min_teams,
    MAX(max_teams) as max_teams,
    AVG(max_teams) as avg_teams
FROM users;

-- Migration completed successfully
-- The max_teams field is now available for use alongside the existing plan field
-- Both fields can coexist during transition period
