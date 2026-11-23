
-- CivicPulse: Automatic Priority Scoring

-- 1. Add priority classification
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS priority_level TEXT
DEFAULT 'Low'
CHECK (priority_level IN ('Low', 'Medium', 'High'));

-- 2. Create automatic priority calculation function
CREATE OR REPLACE FUNCTION public.set_issue_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    calculated_score NUMERIC;
BEGIN
    calculated_score :=
        (COALESCE(NEW.severity, 0) * 0.40) +
        (COALESCE(NEW.impact, 0) * 0.35) +
        (COALESCE(NEW.recurrence, 0) * 0.25);

    NEW.priority_score := ROUND(calculated_score, 2);

    NEW.priority_level :=
        CASE
            WHEN calculated_score >= 70 THEN 'High'
            WHEN calculated_score >= 40 THEN 'Medium'
            ELSE 'Low'
        END;

    RETURN NEW;
END;
$$;

-- 3. Create automatic priority trigger
DROP TRIGGER IF EXISTS issue_priority_trigger
ON public.issues;

CREATE TRIGGER issue_priority_trigger
BEFORE INSERT OR UPDATE OF severity, impact, recurrence
ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.set_issue_priority();

-- 4. Recalculate existing complaints
UPDATE public.issues
SET severity = COALESCE(severity, 0),
    impact = COALESCE(impact, 0),
    recurrence = COALESCE(recurrence, 0);
