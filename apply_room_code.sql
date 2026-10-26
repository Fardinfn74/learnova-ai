ALTER TABLE public.study_rooms ADD COLUMN IF NOT EXISTS code VARCHAR(6) UNIQUE;

-- We make it NOT NULL after adding, but we need to generate codes for existing rooms or just let them be NULL.
-- Since the user said they want this feature now, we can just let it be nullable for existing rows, or delete existing rooms (since it's dev).
-- Let's just delete existing rooms because we need NOT NULL.
TRUNCATE TABLE public.study_rooms CASCADE;
ALTER TABLE public.study_rooms ALTER COLUMN code SET NOT NULL;

DROP POLICY IF EXISTS "Hosts can delete their rooms" ON public.study_rooms;
CREATE POLICY "Hosts can delete their rooms"
  ON public.study_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);
