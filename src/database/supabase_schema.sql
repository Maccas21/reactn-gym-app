-- =========================================
-- EXTENSIONS
-- =========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- USER TABLE
-- =========================================
-- CREATE TABLE UserTable (
    -- User_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Email VARCHAR UNIQUE,
    -- Password VARCHAR,
    -- Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- =========================================
-- MUSCLE TABLE
-- =========================================
CREATE TABLE Muscle (
    Muscle_ID SERIAL PRIMARY KEY,
    Name VARCHAR UNIQUE NOT NULL
);

INSERT INTO Muscle (Name) VALUES
('abdominals'),
('abductors'),
('abs'),
('adductors'),
('ankle stabilizers'),
('ankles'),
('back'),
('biceps'),
('brachialis'),
('calves'),
('cardiovascular system'),
('chest'),
('core'),
('deltoids'),
('delts'),
('feet'),
('forearms'),
('glutes'),
('grip muscles'),
('groin'),
('hamstrings'),
('hands'),
('hip flexors'),
('inner thighs'),
('latissimus dorsi'),
('lats'),
('levator scapulae'),
('lower abs'),
('lower back'),
('obliques'),
('pectorals'),
('quadriceps'),
('quads'),
('rear deltoids'),
('rhomboids'),
('rotator cuff'),
('serratus anterior'),
('shins'),
('shoulders'),
('soleus'),
('spine'),
('sternocleidomastoid'),
('trapezius'),
('traps'),
('triceps'),
('upper back'),
('upper chest'),
('wrist extensors'),
('wrist flexors'),
('wrists');

-- =========================================
-- BODYPART TABLE
-- =========================================
CREATE TABLE BodyPart (
    Body_Part_ID SERIAL PRIMARY KEY,
    Name VARCHAR UNIQUE NOT NULL
);

-- Optional: seed data
INSERT INTO BodyPart (Name) VALUES
('back'),
('cardio'),
('chest'),
('lower arms'),
('lower legs'),
('neck'),
('shoulders'),
('upper arms'),
('upper legs'),
('waist');

-- =========================================
-- EXERCISE TABLE
-- =========================================

CREATE TABLE Exercise (
    Exercise_ID SERIAL PRIMARY KEY,
    Name VARCHAR NOT NULL,
    Description VARCHAR,
    Body_Part_ID INT REFERENCES BodyPart(Body_Part_ID) ON DELETE CASCADE,
    API_External_ID VARCHAR,
    API_Source VARCHAR,
    Created_By_User_ID UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    Is_Custom BOOLEAN DEFAULT FALSE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Last_Used TIMESTAMP,
);

-- =========================================
-- EXERCISEMUSCLE TABLE
-- =========================================
CREATE TABLE ExerciseMuscle (
    ExerciseMuscle_ID SERIAL PRIMARY KEY,
    Exercise_ID INT NOT NULL REFERENCES Exercise(Exercise_ID) ON DELETE CASCADE,
    Muscle_ID INT NOT NULL REFERENCES Muscle(Muscle_ID) ON DELETE CASCADE,
    Is_Primary BOOLEAN DEFAULT FALSE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(Exercise_ID, Muscle_ID)
);

-- =========================================
-- ROUTINE TABLE
-- =========================================
CREATE TABLE Routine (
    Routine_ID SERIAL PRIMARY KEY,
    Name VARCHAR NOT NULL,
    User_ID UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Notes VARCHAR
);

-- =========================================
-- ROUTINEEXERCISE TABLE
-- =========================================
CREATE TABLE RoutineExercise (
    RoutineExercise_ID SERIAL PRIMARY KEY,
    Routine_ID INT NOT NULL REFERENCES Routine(Routine_ID) ON DELETE CASCADE,
    Exercise_ID INT NOT NULL REFERENCES Exercise(Exercise_ID) ON DELETE CASCADE,
    Reps INT CHECK (Reps >= 0),
    Weight FLOAT CHECK (Weight >= 0),
    Distance FLOAT CHECK (Distance >= 0),
    Time_Taken INTERVAL CHECK (EXTRACT(EPOCH FROM Time_Taken) >= 0),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(Routine_ID, Exercise_ID)
);

-- =========================================
-- WORKOUTSESSION TABLE
-- =========================================

CREATE TABLE WorkoutSession (
    Workout_Session_ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    User_ID UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    Notes VARCHAR,
    Start_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    End_Time TIMESTAMP,
    Duration INTERVAL GENERATED ALWAYS AS (End_Time - Start_Time) STORED, -- auto-calculated
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CHECK (End_Time IS NULL OR End_Time >= Start_Time)
);

-- =========================================
-- EXERCISESET TABLE
-- =========================================
CREATE TABLE ExerciseSet (
    ExerciseSet_ID SERIAL PRIMARY KEY,
    Exercise_ID INT NOT NULL REFERENCES Exercise(Exercise_ID) ON DELETE CASCADE,
    Workout_Session_ID UUID NOT NULL REFERENCES WorkoutSession(Workout_Session_ID) ON DELETE CASCADE,
	Set_Number INT NOT NULL,
    Reps INT CHECK (Reps >= 0),
    Weight FLOAT CHECK (Weight >= 0),
    Distance FLOAT CHECK (Distance >= 0),
    Time_Taken INTERVAL CHECK (EXTRACT(EPOCH FROM Time_Taken) >= 0),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(Workout_Session_ID, Exercise_ID, Set_Number)
);

-- =========================================
-- RECORDS TABLE
-- =========================================
-- CREATE TABLE RECORDSTABLE (
    -- Records_ID SERIAL PRIMARY KEY,
    -- Exercise_ID INT NOT NULL REFERENCES Exercise(Exercise_ID) ON DELETE CASCADE,
    -- User_ID UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	-- Record_Type VARCHAR CHECK (Record_Type IN ('Weight','Reps','Distance','Time')),
    -- Reps INT CHECK (Reps >= 0),
    -- Weight FLOAT CHECK (Weight >= 0),
    -- Distance FLOAT CHECK (Distance >= 0),
    -- Time_Taken INTERVAL CHECK (EXTRACT(EPOCH FROM Time_Taken) >= 0),
    -- Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- );

-- =========================================
-- SESSION EXERCISE SUMMARY TABLE
-- =========================================
-- CREATE TABLE SessionExerciseSummary (
    -- Summary_ID SERIAL PRIMARY KEY,
    -- Exercise_ID INT NOT NULL REFERENCES Exercise(Exercise_ID) ON DELETE CASCADE,
    -- Workout_Session_ID UUID NOT NULL REFERENCES WorkoutSession(Workout_Session_ID) ON DELETE CASCADE,
	-- Heaviest_Weight FLOAT CHECK (Heaviest_Weight >=0),
	-- Total_Volume FLOAT CHECK (Total_Volume >=0),
	-- Highest_Reps INT CHECK (Highest_Reps >=0),
	-- Total_Reps INT CHECK (Total_Reps >=0),
	-- Furthest_Distance FLOAT CHECK (Furthest_Distance >=0),
	-- Total_Distance FLOAT CHECK (Total_Distance >=0),
	-- Longest_Time INTERVAL CHECK (EXTRACT(EPOCH FROM Longest_Time) >= 0),
	-- Total_Time  INTERVAL CHECK (EXTRACT(EPOCH FROM Total_Time) >= 0),
    -- Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- );

-- =========================================
-- Update WorkoutSession.End_Time with Triggers
-- =========================================
CREATE OR REPLACE FUNCTION update_end_time()
RETURNS TRIGGER AS $$
DECLARE
    target_session UUID;
BEGIN
    -- Determine the Workout_Session_ID affected
    IF TG_OP = 'DELETE' THEN
        target_session := OLD.Workout_Session_ID;
    ELSE
        target_session := NEW.Workout_Session_ID;
    END IF;

    -- Update the session’s End_Time based on all ExerciseSets
    UPDATE WorkoutSession ws
    SET End_Time = sub.max_end_time,
        Updated_At = CURRENT_TIMESTAMP
    FROM (
        SELECT 
            MAX(
                GREATEST(
                    es.Created_At + INTERVAL '1 hour',
                    es.Created_At + COALESCE(es.Time_Taken, INTERVAL '0 seconds')
                )
            ) AS max_end_time
        FROM ExerciseSet es
        WHERE es.Workout_Session_ID = target_session
    ) sub
    WHERE ws.Workout_Session_ID = target_session;

    RETURN NULL;  -- this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_end_time_ws
AFTER INSERT OR UPDATE OR DELETE ON ExerciseSet
FOR EACH ROW
EXECUTE FUNCTION update_end_time();

-- =========================================
-- EXERCISE LAST_USED TRIGGERS
-- =========================================

CREATE OR REPLACE FUNCTION update_last_used_exercise()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Exercise
    SET Last_Used = NOW()
    WHERE Exercise_ID = NEW.Exercise_ID;
	
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_last_used_es
AFTER INSERT ON ExerciseSet
FOR EACH ROW EXECUTE FUNCTION update_exercise_last_used();

-- =========================================
-- UPDATED_AT TRIGGERS FOR EXERCISE ONLY
-- =========================================

CREATE OR REPLACE FUNCTION set_updatedat_exercise()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.Last_Used IS DISTINCT FROM OLD.Last_Used THEN 
    RETURN NEW; -- skip updating Updated_At
  END IF;

  NEW.Updated_At = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_exercise
BEFORE UPDATE ON Exercise
FOR EACH ROW EXECUTE FUNCTION set_updated_at_exercise();

-- =========================================
-- UPDATED_AT TRIGGERS
-- =========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.Updated_At = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER set_updated_at_user
-- BEFORE UPDATE ON UserTable
-- FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_em
BEFORE UPDATE ON ExerciseMuscle
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_routine
BEFORE UPDATE ON Routine
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_re
BEFORE UPDATE ON RoutineExercise
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_ws
BEFORE UPDATE ON WorkoutSession
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_es
BEFORE UPDATE ON ExerciseSet
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX idx_exerciseset_createdat ON ExerciseSet(Created_At);
CREATE INDEX idx_exerciseset_workoutsession ON ExerciseSet(Workout_Session_ID);
CREATE INDEX idx_exerciseset_exercise ON ExerciseSet(Exercise_ID);
CREATE INDEX idx_workoutsession_user ON WorkoutSession(User_ID);
CREATE INDEX idx_exercise_user ON Exercise(Created_By_User_ID);
CREATE INDEX idx_exercise_name ON Exercise(Name);