-- Phase 5: core game engine.
-- Winner tracking, phase machine, per-player secret access,
-- column-level secret protection, TEMP anonymous gameplay policies
-- (to be replaced by real auth in Phase 18/19).

-- 1. Winner column -------------------------------------------------------
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS winner TEXT;

-- 2. Shared secret picker -------------------------------------------------
CREATE OR REPLACE FUNCTION pick_secret(p_mode VARCHAR(20), p_difficulty VARCHAR(10))
RETURNS TEXT AS $$
DECLARE
  v_secret TEXT;
BEGIN
  SELECT word INTO v_secret
  FROM topics
  WHERE mode = p_mode AND difficulty = p_difficulty
  ORDER BY random()
  LIMIT 1;

  IF v_secret IS NULL THEN
    SELECT word INTO v_secret
    FROM topics
    WHERE mode = p_mode
    ORDER BY random()
    LIMIT 1;
  END IF;

  IF v_secret IS NULL THEN
    v_secret := 'MYSTERY';
  END IF;

  RETURN v_secret;
END;
$$ LANGUAGE plpgsql;

-- 3. Fixed start_game (NULL-safe min players, winner reset) ---------------
CREATE OR REPLACE FUNCTION start_game(p_room_id UUID, p_host_id UUID)
RETURNS TABLE (success BOOLEAN, error TEXT) AS $$
DECLARE
  v_host_id UUID;
  v_room_mode VARCHAR(20);
  v_room_difficulty VARCHAR(10);
  v_player_ids UUID[];
  v_player_count INTEGER;
  v_imposter_count INTEGER;
  v_imposter_ids UUID[];
  v_secret TEXT;
BEGIN
  SELECT host_id, mode, difficulty INTO v_host_id, v_room_mode, v_room_difficulty
  FROM rooms WHERE id = p_room_id;

  IF v_host_id IS NULL THEN
    RETURN QUERY SELECT false, 'Room not found';
    RETURN;
  END IF;

  IF v_host_id != p_host_id THEN
    RETURN QUERY SELECT false, 'Only host can start game';
    RETURN;
  END IF;

  SELECT array_agg(id ORDER BY joined_at), COUNT(*)
  INTO v_player_ids, v_player_count
  FROM players WHERE room_id = p_room_id AND is_connected = true;

  IF v_player_count IS NULL OR v_player_count < 4 THEN
    RETURN QUERY SELECT false, 'Need at least 4 players';
    RETURN;
  END IF;

  v_imposter_count := CASE WHEN v_player_count >= 8 THEN 2 ELSE 1 END;

  SELECT array_agg(id) INTO v_imposter_ids
  FROM (
    SELECT unnest(v_player_ids) AS id
    ORDER BY random()
    LIMIT v_imposter_count
  ) sub;

  v_secret := pick_secret(v_room_mode, v_room_difficulty);

  UPDATE rooms SET status = 'playing', current_round = 1 WHERE id = p_room_id;

  INSERT INTO game_state (room_id, phase, round, secret, imposter_ids, current_turn, timer_ends_at, winner)
  VALUES (p_room_id, 'role_reveal', 1, v_secret, v_imposter_ids, v_player_ids[1], NOW() + INTERVAL '5 seconds', NULL)
  ON CONFLICT (room_id) DO UPDATE SET
    phase = 'role_reveal',
    round = 1,
    secret = EXCLUDED.secret,
    imposter_ids = EXCLUDED.imposter_ids,
    current_turn = EXCLUDED.current_turn,
    timer_ends_at = EXCLUDED.timer_ends_at,
    winner = NULL,
    votes = '{}',
    clues = '{}',
    updated_at = NOW();

  UPDATE players SET role = 'imposter' WHERE id = ANY(v_imposter_ids) AND room_id = p_room_id;
  UPDATE players SET role = 'civilian' WHERE id = ANY(v_player_ids) AND id != ALL(v_imposter_ids) AND room_id = p_room_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Phase machine ----------------------------------------------------------
-- Advances one step: role_reveal -> clue -> discussion -> voting -> result
-- (-> next round role_reveal | game_over). Callable by the host at any time,
-- or by any room member once the phase timer has expired.
CREATE OR REPLACE FUNCTION advance_phase(p_room_id UUID, p_player_id UUID)
RETURNS TABLE (success BOOLEAN, error TEXT, phase VARCHAR(20)) AS $$
DECLARE
  v_gs game_state%ROWTYPE;
  v_room rooms%ROWTYPE;
  v_is_host BOOLEAN;
  v_is_member BOOLEAN;
  v_next_phase VARCHAR(20);
  v_next_timer TIMESTAMPTZ;
  v_player_ids UUID[];
  v_player_count INTEGER;
  v_imposter_count INTEGER;
  v_imposter_ids UUID[];
  v_secret TEXT;
  v_top_target UUID;
  v_top_count INTEGER;
  v_second_count INTEGER;
  v_winner TEXT;
BEGIN
  SELECT * INTO v_gs FROM game_state WHERE room_id = p_room_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Game has not started', NULL::VARCHAR(20);
    RETURN;
  END IF;

  SELECT * INTO v_room FROM rooms WHERE id = p_room_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Room not found', NULL::VARCHAR(20);
    RETURN;
  END IF;

  SELECT EXISTS (SELECT 1 FROM players WHERE id = p_player_id AND room_id = p_room_id)
  INTO v_is_member;
  IF NOT v_is_member THEN
    RETURN QUERY SELECT false, 'Not a room member', v_gs.phase;
    RETURN;
  END IF;

  SELECT is_host INTO v_is_host FROM players WHERE id = p_player_id;

  IF NOT v_is_host AND (v_gs.timer_ends_at IS NULL OR v_gs.timer_ends_at > NOW()) THEN
    RETURN QUERY SELECT false, 'Phase timer still running', v_gs.phase;
    RETURN;
  END IF;

  IF v_gs.phase = 'game_over' THEN
    RETURN QUERY SELECT false, 'Game is over', v_gs.phase;
    RETURN;
  END IF;

  -- role_reveal -> clue (30s) ----------------------------------------------
  IF v_gs.phase = 'role_reveal' THEN
    v_next_phase := 'clue';
    v_next_timer := NOW() + INTERVAL '30 seconds';
    UPDATE game_state SET phase = v_next_phase, timer_ends_at = v_next_timer, updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- clue -> discussion (60s) -------------------------------------------------
  IF v_gs.phase = 'clue' THEN
    v_next_phase := 'discussion';
    v_next_timer := NOW() + INTERVAL '60 seconds';
    UPDATE game_state SET phase = v_next_phase, timer_ends_at = v_next_timer, updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- discussion -> voting (20s, votes reset) -----------------------------------
  IF v_gs.phase = 'discussion' THEN
    v_next_phase := 'voting';
    v_next_timer := NOW() + INTERVAL '20 seconds';
    UPDATE game_state SET phase = v_next_phase, timer_ends_at = v_next_timer, votes = '{}', updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- voting -> result (tally + winner) ------------------------------------------
  IF v_gs.phase = 'voting' THEN
    SELECT target::UUID, cnt INTO v_top_target, v_top_count
    FROM (
      SELECT value AS target, COUNT(*) AS cnt
      FROM jsonb_each_text(v_gs.votes)
      GROUP BY value
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) top;

    IF v_top_target IS NULL THEN
      -- Nobody voted: the Imposter walks free.
      v_winner := 'imposter';
    ELSE
      SELECT COALESCE(MAX(cnt), 0) INTO v_second_count
      FROM (
        SELECT COUNT(*) AS cnt
        FROM jsonb_each_text(v_gs.votes)
        GROUP BY value
        HAVING value != v_top_target::TEXT
      ) rest;

      IF v_top_count > v_second_count AND v_top_target = ANY(v_gs.imposter_ids) THEN
        v_winner := 'civilians';
      ELSE
        v_winner := 'imposter';
      END IF;
    END IF;

    v_next_phase := 'result';
    v_next_timer := NOW() + INTERVAL '8 seconds';
    UPDATE game_state
    SET phase = v_next_phase, timer_ends_at = v_next_timer, winner = v_winner, updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- result -> next round role_reveal | game_over --------------------------------
  IF v_gs.phase = 'result' THEN
    IF v_gs.round >= v_room.rounds THEN
      UPDATE game_state SET phase = 'game_over', timer_ends_at = NULL, updated_at = NOW()
      WHERE room_id = p_room_id;
      UPDATE rooms SET status = 'finished' WHERE id = p_room_id;
      RETURN QUERY SELECT true, NULL::TEXT, 'game_over'::VARCHAR(20);
      RETURN;
    END IF;

    SELECT array_agg(id ORDER BY joined_at), COUNT(*)
    INTO v_player_ids, v_player_count
    FROM players WHERE room_id = p_room_id AND is_connected = true;

    IF v_player_count IS NULL OR v_player_count < 4 THEN
      UPDATE game_state SET phase = 'game_over', timer_ends_at = NULL, updated_at = NOW()
      WHERE room_id = p_room_id;
      UPDATE rooms SET status = 'finished' WHERE id = p_room_id;
      RETURN QUERY SELECT true, NULL::TEXT, 'game_over'::VARCHAR(20);
      RETURN;
    END IF;

    v_imposter_count := CASE WHEN v_player_count >= 8 THEN 2 ELSE 1 END;
    SELECT array_agg(id) INTO v_imposter_ids
    FROM (
      SELECT unnest(v_player_ids) AS id
      ORDER BY random()
      LIMIT v_imposter_count
    ) sub;

    v_secret := pick_secret(v_room.mode, v_room.difficulty);

    UPDATE game_state
    SET phase = 'role_reveal',
        round = v_gs.round + 1,
        secret = v_secret,
        imposter_ids = v_imposter_ids,
        current_turn = v_player_ids[1],
        timer_ends_at = NOW() + INTERVAL '5 seconds',
        winner = NULL,
        votes = '{}',
        clues = '{}',
        updated_at = NOW()
    WHERE room_id = p_room_id;

    UPDATE rooms SET current_round = v_gs.round + 1 WHERE id = p_room_id;
    UPDATE players SET role = 'imposter' WHERE id = ANY(v_imposter_ids) AND room_id = p_room_id;
    UPDATE players SET role = 'civilian' WHERE id = ANY(v_player_ids) AND id != ALL(v_imposter_ids) AND room_id = p_room_id;

    RETURN QUERY SELECT true, NULL::TEXT, 'role_reveal'::VARCHAR(20);
    RETURN;
  END IF;

  -- lobby / unknown: nothing to advance.
  RETURN QUERY SELECT false, 'Nothing to advance', v_gs.phase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Per-player view: role always, secret only for civilians -------------------
CREATE OR REPLACE FUNCTION get_my_view(p_room_id UUID, p_player_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_role TEXT;
  v_secret TEXT;
BEGIN
  SELECT role INTO v_role FROM players WHERE id = p_player_id AND room_id = p_room_id;
  IF v_role IS NULL THEN
    RETURN jsonb_build_object('role', NULL, 'secret', NULL);
  END IF;
  IF v_role = 'civilian' THEN
    SELECT secret INTO v_secret FROM game_state WHERE room_id = p_room_id;
  END IF;
  RETURN jsonb_build_object('role', v_role, 'secret', v_secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Column-level secret protection ---------------------------------------------
-- The Imposter's client must never receive the secret through direct reads.
-- get_my_view (SECURITY DEFINER) is the only path to it.
REVOKE SELECT (secret) ON game_state FROM anon, authenticated;

-- 7. TEMP anonymous gameplay policies ---------------------------------------------
-- Anonymous play (no login until Phase 19) cannot satisfy auth.uid() RLS
-- checks, so gameplay reads/writes are open for the MVP. Server-side
-- validation lives in the RPCs + API routes. Harden in Phase 18.
DROP POLICY IF EXISTS "Anyone can view waiting rooms" ON rooms;
CREATE POLICY "TEMP MVP: anyone can read rooms" ON rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can view players in their room" ON players;
CREATE POLICY "TEMP MVP: anyone can read players" ON players
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can join a room" ON players;
CREATE POLICY "TEMP MVP: anyone can insert players" ON players
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Players can update themselves" ON players;
CREATE POLICY "TEMP MVP: anyone can update players" ON players
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Host can remove players" ON players;
CREATE POLICY "TEMP MVP: anyone can delete players" ON players
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Players can view game state for their room" ON game_state;
CREATE POLICY "TEMP MVP: anyone can read game state" ON game_state
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can view messages in their room" ON messages;
CREATE POLICY "TEMP MVP: anyone can read messages" ON messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can send messages in their room" ON messages;
CREATE POLICY "TEMP MVP: anyone can send messages" ON messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Players can view reactions in their room" ON reactions;
CREATE POLICY "TEMP MVP: anyone can read reactions" ON reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can add reactions in their room" ON reactions;
CREATE POLICY "TEMP MVP: anyone can add reactions" ON reactions
  FOR INSERT WITH CHECK (true);
