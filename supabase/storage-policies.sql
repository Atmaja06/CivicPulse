
-- CivicPulse: Private complaint photo storage policies

-- 1. Allow authenticated citizens to upload photos
-- only inside their own user-ID folder.

DROP POLICY IF EXISTS "Citizens upload issue photos"
ON storage.objects;

CREATE POLICY "Citizens upload issue photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'issue-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Allow users to view their own photos.
-- Municipality users can view all complaint photos.

DROP POLICY IF EXISTS "Citizens and municipality view issue photos"
ON storage.objects;

CREATE POLICY "Citizens and municipality view issue photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'issue-photos'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'municipality'
    )
);

-- 3. Allow citizens to delete their own photos.

DROP POLICY IF EXISTS "Citizens delete own issue photos"
ON storage.objects;

CREATE POLICY "Citizens delete own issue photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'issue-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
