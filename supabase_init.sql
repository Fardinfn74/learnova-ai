-- Run this in your Supabase SQL Editor

-- 1. BATTLES TABLE
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
  topic TEXT NOT NULL,
  player1_id UUID REFERENCES auth.users(id),
  player2_id UUID REFERENCES auth.users(id),
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read battles" ON public.battles;
CREATE POLICY "Anyone can read battles" 
  ON public.battles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create battles" ON public.battles;
CREATE POLICY "Authenticated users can create battles" 
  ON public.battles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = player1_id);

DROP POLICY IF EXISTS "Players can update their battles" ON public.battles;
CREATE POLICY "Players can update their battles" 
  ON public.battles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = player1_id OR auth.uid() = player2_id OR player2_id IS NULL);

-- Enable Realtime for battles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'battles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;
  END IF;
END $$;


-- 2. STUDY ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.study_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  topic TEXT NOT NULL,
  host_id UUID REFERENCES auth.users(id) NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL
);

ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read rooms" ON public.study_rooms;
CREATE POLICY "Anyone can read rooms" 
  ON public.study_rooms FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.study_rooms;
CREATE POLICY "Authenticated users can create rooms" 
  ON public.study_rooms FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts can delete their rooms" ON public.study_rooms;
CREATE POLICY "Hosts can delete their rooms"
  ON public.study_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);


-- 3. STUDY MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.study_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  room_id UUID REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL means it's Nova
  content TEXT NOT NULL,
  is_nova BOOLEAN DEFAULT false
);

ALTER TABLE public.study_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read room messages" ON public.study_messages;
CREATE POLICY "Anyone can read room messages" 
  ON public.study_messages FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.study_messages;
CREATE POLICY "Authenticated users can insert messages" 
  ON public.study_messages FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR is_nova = true);

-- Enable Realtime for study messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'study_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.study_messages;
  END IF;
END $$;

-- Force Supabase PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
