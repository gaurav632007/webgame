-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 8,
  mode VARCHAR(20) NOT NULL DEFAULT 'classic',
  difficulty VARCHAR(10) NOT NULL DEFAULT 'medium',
  rounds INTEGER NOT NULL DEFAULT 3,
  current_round INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(30) NOT NULL,
  avatar_id INTEGER NOT NULL DEFAULT 1,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(20) NOT NULL DEFAULT 'spectator',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_connected BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(room_id, nickname)
);

-- Game state table
CREATE TABLE game_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
  phase VARCHAR(20) NOT NULL DEFAULT 'lobby',
  round INTEGER NOT NULL DEFAULT 0,
  secret TEXT,
  imposter_ids UUID[] NOT NULL DEFAULT '{}',
  current_turn UUID,
  timer_ends_at TIMESTAMPTZ,
  votes JSONB NOT NULL DEFAULT '{}',
  clues JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_nickname VARCHAR(30) NOT NULL,
  player_avatar INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('clue', 'message')),
  target_id UUID NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('laugh', 'think', 'shock', 'eyes', 'fire')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  mode VARCHAR(20) NOT NULL,
  image_url TEXT,
  related_words TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Game results table
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  winner VARCHAR(20) NOT NULL CHECK (winner IN ('civilians', 'imposter')),
  imposter_ids UUID[] NOT NULL,
  civilian_ids UUID[] NOT NULL,
  duration_ms BIGINT NOT NULL,
  rounds_played INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom topic packs table
CREATE TABLE topic_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  topics TEXT[] NOT NULL,
  creator_id UUID,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_host_id ON rooms(host_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_room_id_nickname ON players(room_id, nickname);
CREATE INDEX idx_game_state_room_id ON game_state(room_id);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_reactions_room_id ON reactions(room_id);
CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX idx_topics_mode_difficulty ON topics(mode, difficulty);
CREATE INDEX idx_game_results_room_id ON game_results(room_id);
CREATE INDEX idx_game_results_created_at ON game_results(created_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at BEFORE UPDATE ON game_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_packs ENABLE ROW LEVEL SECURITY;

-- Rooms policies
CREATE POLICY "Anyone can view waiting rooms" ON rooms
  FOR SELECT USING (status = 'waiting');

CREATE POLICY "Players can view their room" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM players WHERE players.room_id = rooms.id AND players.id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create rooms" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Host can update their room" ON rooms
  FOR UPDATE USING (host_id = auth.uid());

-- Players policies
CREATE POLICY "Players can view players in their room" ON players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM players p2 WHERE p2.room_id = players.room_id AND p2.id = auth.uid()
    )
  );

CREATE POLICY "Anyone can join a room" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can update themselves" ON players
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Host can remove players" ON players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms WHERE rooms.id = players.room_id AND rooms.host_id = auth.uid()
    )
  );

-- Game state policies
CREATE POLICY "Players can view game state for their room" ON game_state
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM players WHERE players.room_id = game_state.room_id AND players.id = auth.uid()
    )
  );

CREATE POLICY "System can manage game state" ON game_state
  FOR ALL USING (true);

-- Messages policies
CREATE POLICY "Players can view messages in their room" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM players WHERE players.room_id = messages.room_id AND players.id = auth.uid()
    )
  );

CREATE POLICY "Players can send messages in their room" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM players WHERE players.room_id = messages.room_id AND players.id = auth.uid()
    )
  );

-- Reactions policies
CREATE POLICY "Players can view reactions in their room" ON reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM players WHERE players.room_id = reactions.room_id AND players.id = auth.uid()
    )
  );

CREATE POLICY "Players can add reactions in their room" ON reactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM players WHERE players.room_id = reactions.room_id AND players.id = auth.uid()
    )
  );

-- Topics policies
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

-- Game results policies
CREATE POLICY "Players can view results for their room" ON game_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM players WHERE players.room_id = game_results.room_id AND players.id = auth.uid()
    )
  );

CREATE POLICY "System can insert results" ON game_results
  FOR INSERT WITH CHECK (true);

-- Topic packs policies
CREATE POLICY "Anyone can view public packs" ON topic_packs
  FOR SELECT USING (is_public = true);

CREATE POLICY "Creators can view their packs" ON topic_packs
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Anyone can create packs" ON topic_packs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update their packs" ON topic_packs
  FOR UPDATE USING (creator_id = auth.uid());

-- Function to generate room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code VARCHAR(6);
  exists_bool BOOLEAN;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * 36 + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM rooms WHERE code = generate_room_code.code) INTO exists_bool;
    IF NOT exists_bool THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to create room with code
CREATE OR REPLACE FUNCTION create_room_with_code(
  p_host_id UUID,
  p_max_players INTEGER,
  p_mode VARCHAR(20),
  p_difficulty VARCHAR(10),
  p_rounds INTEGER
)
RETURNS TABLE (room_id UUID, code VARCHAR(6)) AS $$
DECLARE
  v_code VARCHAR(6);
  v_room_id UUID;
BEGIN
  v_code := generate_room_code();
  
  INSERT INTO rooms (code, host_id, max_players, mode, difficulty, rounds)
  VALUES (v_code, p_host_id, p_max_players, p_mode, p_difficulty, p_rounds)
  RETURNING id, code INTO v_room_id, v_code;
  
  RETURN QUERY SELECT v_room_id, v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join room
CREATE OR REPLACE FUNCTION join_room(
  p_room_code VARCHAR(6),
  p_player_id UUID,
  p_nickname VARCHAR(30),
  p_avatar_id INTEGER
)
RETURNS TABLE (success BOOLEAN, error TEXT, player_id UUID) AS $$
DECLARE
  v_room_id UUID;
  v_player_count INTEGER;
  v_room_status VARCHAR(20);
  v_max_players INTEGER;
BEGIN
  -- Check room exists and get details
  SELECT id, status, max_players INTO v_room_id, v_room_status, v_max_players
  FROM rooms WHERE code = p_room_code;
  
  IF v_room_id IS NULL THEN
    RETURN QUERY SELECT false, 'Room not found', NULL::UUID;
    RETURN;
  END IF;
  
  IF v_room_status != 'waiting' THEN
    RETURN QUERY SELECT false, 'Game already started', NULL::UUID;
    RETURN;
  END IF;
  
  -- Check player count
  SELECT COUNT(*) INTO v_player_count FROM players WHERE room_id = v_room_id;
  
  IF v_player_count >= v_max_players THEN
    RETURN QUERY SELECT false, 'Room is full', NULL::UUID;
    RETURN;
  END IF;
  
  -- Check nickname uniqueness
  IF EXISTS (SELECT 1 FROM players WHERE room_id = v_room_id AND nickname = p_nickname) THEN
    RETURN QUERY SELECT false, 'Nickname already taken', NULL::UUID;
    RETURN;
  END IF;
  
  -- Insert player
  INSERT INTO players (room_id, nickname, avatar_id, is_host)
  VALUES (v_room_id, p_nickname, p_avatar_id, false)
  RETURNING id INTO v_player_id;
  
  RETURN QUERY SELECT true, NULL, v_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start game
CREATE OR REPLACE FUNCTION start_game(p_room_id UUID, p_host_id UUID)
RETURNS TABLE (success BOOLEAN, error TEXT) AS $$
DECLARE
  v_host_id UUID;
  v_player_ids UUID[];
  v_imposter_count INTEGER;
  v_imposter_ids UUID[];
  v_secret TEXT;
  v_topic_record RECORD;
BEGIN
  -- Verify host
  SELECT host_id INTO v_host_id FROM rooms WHERE id = p_room_id;
  
  IF v_host_id != p_host_id THEN
    RETURN QUERY SELECT false, 'Only host can start game';
    RETURN;
  END IF;
  
  -- Get players
  SELECT array_agg(id) INTO v_player_ids
  FROM players WHERE room_id = p_room_id AND is_connected = true;
  
  IF array_length(v_player_ids, 1) < 4 THEN
    RETURN QUERY SELECT false, 'Need at least 4 players';
    RETURN;
  END IF;
  
  -- Determine imposter count (1 for 4-7 players, 2 for 8+)
  v_imposter_count := CASE WHEN array_length(v_player_ids, 1) >= 8 THEN 2 ELSE 1 END;
  
  -- Select imposters randomly
  SELECT array_agg(id) INTO v_imposter_ids
  FROM (
    SELECT id FROM unnest(v_player_ids) AS id
    ORDER BY random()
    LIMIT v_imposter_count
  ) sub;
  
  -- Get a random topic based on room settings
  SELECT word INTO v_secret
  FROM topics
  WHERE mode = (SELECT mode FROM rooms WHERE id = p_room_id)
    AND difficulty = (SELECT difficulty FROM rooms WHERE id = p_room_id)
  ORDER BY random()
  LIMIT 1;
  
  IF v_secret IS NULL THEN
    v_secret := 'MYSTERY';
  END IF;
  
  -- Update room status
  UPDATE rooms SET status = 'playing', current_round = 1 WHERE id = p_room_id;
  
  -- Create/Update game state
  INSERT INTO game_state (room_id, phase, round, secret, imposter_ids, current_turn, timer_ends_at)
  VALUES (p_room_id, 'role_reveal', 1, v_secret, v_imposter_ids, v_player_ids[1], NOW() + INTERVAL '5 seconds')
  ON CONFLICT (room_id) DO UPDATE SET
    phase = 'role_reveal',
    round = 1,
    secret = v_secret,
    imposter_ids = v_imposter_ids,
    current_turn = v_player_ids[1],
    timer_ends_at = NOW() + INTERVAL '5 seconds',
    votes = '{}',
    clues = '{}',
    updated_at = NOW();
  
  -- Update player roles
  UPDATE players SET role = 'imposter' WHERE id = ANY(v_imposter_ids) AND room_id = p_room_id;
  UPDATE players SET role = 'civilian' WHERE id = ANY(v_player_ids) AND id != ALL(v_imposter_ids) AND room_id = p_room_id;
  
  RETURN QUERY SELECT true, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;