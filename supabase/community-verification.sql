
-- 1. Create community verification table

CREATE TABLE IF NOT EXISTS public.issue_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_resolved BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (issue_id, user_id)
);

-- 2. Enable Row Level Security

ALTER TABLE public.issue_verifications
ENABLE ROW LEVEL SECURITY;

-- 3. Allow authenticated users to view verifications

DROP POLICY IF EXISTS "Citizens can view verifications"
ON public.issue_verifications;

CREATE POLICY "Citizens can view verifications"
ON public.issue_verifications
FOR SELECT TO authenticated
USING (true);

-- 4. Allow citizens to verify resolved complaints

DROP POLICY IF EXISTS "Citizens can submit verifications"
ON public.issue_verifications;

CREATE POLICY "Citizens can submit verifications"
ON public.issue_verifications
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1
        FROM public.issues
        WHERE issues.id = issue_id
        AND issues.status = 'Resolved'
    )
);

GRANT SELECT, INSERT
ON public.issue_verifications
TO authenticated;

-- 5. Create automatic community verification function

CREATE OR REPLACE FUNCTION public.check_community_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    confirmation_count INTEGER;
BEGIN
    IF NEW.is_resolved = TRUE THEN

        SELECT COUNT(DISTINCT user_id)
        INTO confirmation_count
        FROM public.issue_verifications
        WHERE issue_id = NEW.issue_id
        AND is_resolved = TRUE;

        IF confirmation_count >= 3 THEN
            UPDATE public.issues
            SET status = 'Community Verified',
                updated_at = NOW()
            WHERE id = NEW.issue_id
            AND status = 'Resolved';
        END IF;

    END IF;

    RETURN NEW;
END;
$$;

-- 6. Create automatic trigger

DROP TRIGGER IF EXISTS community_verification_trigger
ON public.issue_verifications;

CREATE TRIGGER community_verification_trigger
AFTER INSERT ON public.issue_verifications
FOR EACH ROW
EXECUTE FUNCTION public.check_community_verification();

-- 7. Restrict direct execution of trigger function

REVOKE ALL ON FUNCTION public.check_community_verification()
FROM PUBLIC, anon, authenticated;
