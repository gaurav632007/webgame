-- Phase 15: blind-imposter engine + host dataset picker + spec timers/scoring.
-- 4 difficulties (easy/medium/hard/expert). Hard/Expert imposters receive a
-- similar word and are NEVER told they are different.
-- Run once in the SQL editor. Idempotent (IF NOT EXISTS / CREATE OR REPLACE).

-- 1. Four difficulties only ------------------------------------------------------
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_difficulty_check;
ALTER TABLE topics ADD CONSTRAINT topics_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert'));

-- 2. Word pairs for the blind mechanic ---------------------------------------------
CREATE TABLE IF NOT EXISTS word_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_a TEXT NOT NULL,
  word_b TEXT NOT NULL,
  similarity INTEGER NOT NULL CHECK (similarity BETWEEN 0 AND 100),
  level VARCHAR(10) NOT NULL CHECK (level IN ('hard', 'expert')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_word_pairs_word_a ON word_pairs(word_a);
CREATE INDEX IF NOT EXISTS idx_word_pairs_level ON word_pairs(level);
ALTER TABLE word_pairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view pairs" ON word_pairs;
CREATE POLICY "Anyone can view pairs" ON word_pairs FOR SELECT USING (true);

-- Reseed pairs (safe to re-run this file; admin-owned pairs arrive in Phase 17).
DELETE FROM word_pairs;

-- Classic hard pool pairs (word -> hard / expert alternate)
INSERT INTO word_pairs (word_a, word_b, similarity, level) VALUES
('Barista', 'Waiter', 62, 'hard'), ('Barista', 'Bartender', 89, 'expert'),
('Origami', 'Craft', 64, 'hard'), ('Origami', 'Paper Craft', 92, 'expert'),
('Parachute', 'Glider', 66, 'hard'), ('Parachute', 'Skydiving', 90, 'expert'),
('Thermometer', 'Scale', 60, 'hard'), ('Thermometer', 'Fever Meter', 91, 'expert'),
('Telescope', 'Binoculars', 78, 'hard'), ('Telescope', 'Observatory', 89, 'expert'),
('Waterfall', 'Fountain', 66, 'hard'), ('Waterfall', 'Cascade', 92, 'expert'),
('Lighthouse', 'Tower', 70, 'hard'), ('Lighthouse', 'Beacon', 90, 'expert'),
('Igloo', 'Hut', 62, 'hard'), ('Igloo', 'Ice Hut', 93, 'expert'),
('Encore', 'Repeat', 76, 'hard'), ('Encore', 'Curtain Call', 89, 'expert'),
('Espresso', 'Coffee', 80, 'hard'), ('Espresso', 'Ristretto', 94, 'expert');

-- Desi hard pool pairs
INSERT INTO word_pairs (word_a, word_b, similarity, level) VALUES
('IRCTC', 'Railways', 78, 'hard'), ('IRCTC', 'Tatkal', 89, 'expert'),
('UPI', 'GPay', 84, 'hard'), ('UPI', 'BHIM UPI', 93, 'expert'),
('Baraat', 'Procession', 72, 'hard'), ('Baraat', 'Barat', 96, 'expert'),
('Jugaad', 'Hack', 74, 'hard'), ('Jugaad', 'Tweak', 88, 'expert'),
('Shaadi DJ', 'DJ', 78, 'hard'), ('Shaadi DJ', 'Wedding DJ', 94, 'expert'),
('PG Life', 'Hostel Life', 82, 'hard'), ('PG Life', 'Paying Guest', 95, 'expert'),
('CAT Exam', 'GMAT', 78, 'hard'), ('CAT Exam', 'MBA Entrance', 92, 'expert'),
('Tiffin Dabba', 'Lunchbox', 86, 'hard'), ('Tiffin Dabba', 'Dabba', 94, 'expert'),
('Rickshaw Meter', 'Meter', 80, 'hard'), ('Rickshaw Meter', 'Fare Meter', 93, 'expert'),
('Gully Cricket', 'Street Cricket', 88, 'hard'), ('Gully Cricket', 'Galli Match', 95, 'expert');

-- Desi expert pool pairs
INSERT INTO word_pairs (word_a, word_b, similarity, level) VALUES
('Tatkal Booking', 'Emergency Quota', 82, 'hard'), ('Tatkal Booking', 'Tatkaal', 96, 'expert'),
('Sleeper Class', 'General Class', 78, 'hard'), ('Sleeper Class', 'Sleeper Coach', 94, 'expert'),
('Platform Ticket', 'Entry Pass', 74, 'hard'), ('Platform Ticket', 'Platform Pass', 93, 'expert'),
('Share Auto', 'Auto', 76, 'hard'), ('Share Auto', 'Shared Rickshaw', 92, 'expert'),
('Vada Pav', 'Burger', 72, 'hard'), ('Vada Pav', 'Batata Vada Pav', 93, 'expert'),
('Jalebi Fafda', 'Jalebi', 80, 'hard'), ('Jalebi Fafda', 'Fafda Jalebi', 95, 'expert'),
('Mohalla', 'Locality', 78, 'hard'), ('Mohalla', 'Colony', 90, 'expert'),
('Load Shedding', 'Power Cut', 86, 'hard'), ('Load Shedding', 'Bijli Cut', 92, 'expert'),
('Doosra', 'Googly', 80, 'hard'), ('Doosra', 'Teesra', 93, 'expert'),
('Sangeet Night', 'DJ Night', 74, 'hard'), ('Sangeet Night', 'Sangeet Sandhya', 92, 'expert');

-- Hardcore pool pairs
INSERT INTO word_pairs (word_a, word_b, similarity, level) VALUES
('LBW', 'Bowled', 76, 'hard'), ('LBW', 'Plumb LBW', 90, 'expert'),
('Googly', 'Leg Spin', 80, 'hard'), ('Googly', 'Wrong Un', 92, 'expert'),
('Yorker', 'Bouncer', 74, 'hard'), ('Yorker', 'Toe Crusher', 93, 'expert'),
('Offside', 'Foul', 68, 'hard'), ('Offside', 'Off-side Trap', 90, 'expert'),
('Hat-trick', 'Three Wickets', 78, 'hard'), ('Hat-trick', 'Triple Strike', 91, 'expert'),
('Penalty Shootout', 'Free Kick', 72, 'hard'), ('Penalty Shootout', 'Spot Kick', 93, 'expert'),
('Engagement Ceremony', 'Wedding', 74, 'hard'), ('Engagement Ceremony', 'Ring Ceremony', 95, 'expert'),
('Pre-wedding Shoot', 'Photoshoot', 70, 'hard'), ('Pre-wedding Shoot', 'Couple Shoot', 92, 'expert'),
('Night Watchman', 'Tailender', 78, 'hard'), ('Night Watchman', 'Nightwatchman', 97, 'expert'),
('Third Umpire', 'Umpire', 80, 'hard'), ('Third Umpire', 'TV Umpire', 94, 'expert');

-- Easy/medium pool pairs (used when those rooms play blind-style later, harmless now)
INSERT INTO word_pairs (word_a, word_b, similarity, level) VALUES
('Pizza', 'Burger', 72, 'hard'), ('Pizza', 'Calzone', 93, 'expert'),
('Tea', 'Coffee', 78, 'hard'), ('Tea', 'Masala Chai', 94, 'expert'),
('Cricket', 'Football', 70, 'hard'), ('Cricket', 'Gully Cricket', 92, 'expert'),
('Chai', 'Coffee', 76, 'hard'), ('Chai', 'Cutting Chai', 95, 'expert'),
('Diwali', 'Dussehra', 78, 'hard'), ('Diwali', 'Deepavali', 97, 'expert'),
('Samosa', 'Kachori', 82, 'hard'), ('Samosa', 'Punjabi Samosa', 93, 'expert'),
('Maggi', 'Noodles', 86, 'hard'), ('Maggi', 'Masala Maggi', 94, 'expert'),
('Cappuccino', 'Espresso', 80, 'hard'), ('Cappuccino', 'Latte', 96, 'expert'),
('Metro', 'Train', 76, 'hard'), ('Metro', 'Subway', 93, 'expert'),
('UPI', 'GPay', 84, 'hard'), ('UPI', 'BHIM UPI', 93, 'expert');

-- 3. Host dataset picker: rooms choose category packs -------------------------------
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS datasets TEXT[] NOT NULL DEFAULT '{}';

-- 4. Alternate word storage (sealed like secret) --------------------------------------
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS imposter_word TEXT;

-- 5. Secret picker with dataset filter -----------------------------------------------
CREATE OR REPLACE FUNCTION pick_secret(p_mode VARCHAR(20), p_difficulty VARCHAR(10), p_datasets TEXT[] DEFAULT '{}')
RETURNS TEXT AS $$
DECLARE
  v_secret TEXT;
BEGIN
  SELECT word INTO v_secret
  FROM topics
  WHERE mode = p_mode AND difficulty = p_difficulty
    AND (coalesce(array_length(p_datasets, 1), 0) = 0 OR category = ANY(p_datasets))
    AND (hint IS NOT NULL OR p_difficulty NOT IN ('easy', 'medium'))
  ORDER BY random()
  LIMIT 1;

  IF v_secret IS NULL THEN
    SELECT word INTO v_secret
    FROM topics
    WHERE mode = p_mode
      AND (coalesce(array_length(p_datasets, 1), 0) = 0 OR category = ANY(p_datasets))
    ORDER BY random()
    LIMIT 1;
  END IF;

  IF v_secret IS NULL THEN
    v_secret := 'MYSTERY';
  END IF;

  RETURN v_secret;
END;
$$ LANGUAGE plpgsql;

-- 6. Alternate-word picker for the blind mechanic --------------------------------------
CREATE OR REPLACE FUNCTION pick_imposter_word(p_secret TEXT, p_level VARCHAR(10))
RETURNS TEXT AS $$
DECLARE
  v_alt TEXT;
BEGIN
  SELECT word_b INTO v_alt
  FROM word_pairs
  WHERE word_a = p_secret AND level = p_level AND active = true
  ORDER BY random()
  LIMIT 1;

  IF v_alt IS NULL THEN
    SELECT word_b INTO v_alt
    FROM word_pairs
    WHERE word_a = p_secret AND active = true
    ORDER BY random()
    LIMIT 1;
  END IF;

  RETURN v_alt;
END;
$$ LANGUAGE plpgsql;

-- 7. Spec timers: Easy 30/60/20 · Medium 20/60/20 · Hard 15/45/15 · Expert 10/30/12 --
CREATE OR REPLACE FUNCTION phase_seconds(p_phase TEXT, p_difficulty TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF p_phase = 'role_reveal' THEN RETURN 5; END IF;
  IF p_phase = 'result' THEN RETURN 8; END IF;
  IF p_phase = 'clue' THEN
    RETURN CASE p_difficulty WHEN 'easy' THEN 30 WHEN 'medium' THEN 20 WHEN 'hard' THEN 15 WHEN 'expert' THEN 10 ELSE 20 END;
  END IF;
  IF p_phase = 'discussion' THEN
    RETURN CASE p_difficulty WHEN 'easy' THEN 60 WHEN 'medium' THEN 60 WHEN 'hard' THEN 45 WHEN 'expert' THEN 30 ELSE 60 END;
  END IF;
  IF p_phase = 'voting' THEN
    RETURN CASE p_difficulty WHEN 'easy' THEN 20 WHEN 'medium' THEN 20 WHEN 'hard' THEN 15 WHEN 'expert' THEN 12 ELSE 20 END;
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. start_game v3 (datasets, blind word, new scoring reset) ------------------------------
CREATE OR REPLACE FUNCTION start_game(p_room_id UUID, p_host_id UUID)
RETURNS TABLE (success BOOLEAN, error TEXT) AS $$
DECLARE
  v_host_id UUID;
  v_room_mode VARCHAR(20);
  v_room_difficulty VARCHAR(10);
  v_room_datasets TEXT[];
  v_player_ids UUID[];
  v_player_count INTEGER;
  v_imposter_count INTEGER;
  v_imposter_ids UUID[];
  v_secret TEXT;
  v_topic_id UUID;
  v_imp_word TEXT;
BEGIN
  SELECT host_id, mode, difficulty, datasets INTO v_host_id, v_room_mode, v_room_difficulty, v_room_datasets
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

  IF v_room_mode = 'double-imposter' AND v_player_count < 7 THEN
    RETURN QUERY SELECT false, 'Double Imposter needs at least 7 players';
    RETURN;
  END IF;

  IF v_room_mode = 'double-imposter' THEN
    v_imposter_count := CASE WHEN v_player_count >= 10 THEN 3 ELSE 2 END;
  ELSE
    v_imposter_count := CASE WHEN v_player_count >= 8 THEN 2 ELSE 1 END;
  END IF;

  SELECT array_agg(id) INTO v_imposter_ids
  FROM (
    SELECT unnest(v_player_ids) AS id
    ORDER BY random()
    LIMIT v_imposter_count
  ) sub;

  v_secret := pick_secret(v_room_mode, v_room_difficulty, v_room_datasets);
  SELECT id INTO v_topic_id FROM topics
  WHERE word = v_secret AND mode = v_room_mode AND difficulty = v_room_difficulty
  LIMIT 1;
  IF v_topic_id IS NULL THEN
    SELECT id INTO v_topic_id FROM topics WHERE word = v_secret LIMIT 1;
  END IF;

  IF v_room_difficulty IN ('hard', 'expert') OR v_room_mode = 'blind-bluff' THEN
    v_imp_word := pick_imposter_word(v_secret, CASE WHEN v_room_difficulty = 'expert' THEN 'expert' ELSE 'hard' END);
  ELSE
    v_imp_word := NULL;
  END IF;

  UPDATE rooms SET status = 'playing', current_round = 1 WHERE id = p_room_id;

  INSERT INTO game_state (room_id, phase, round, secret, secret_topic_id, imposter_word, imposter_ids, current_turn, timer_ends_at, winner)
  VALUES (p_room_id, 'role_reveal', 1, v_secret, v_topic_id, v_imp_word, v_imposter_ids, v_player_ids[1], NOW() + INTERVAL '5 seconds', NULL)
  ON CONFLICT (room_id) DO UPDATE SET
    phase = 'role_reveal',
    round = 1,
    secret = EXCLUDED.secret,
    secret_topic_id = EXCLUDED.secret_topic_id,
    imposter_word = EXCLUDED.imposter_word,
    imposter_ids = EXCLUDED.imposter_ids,
    current_turn = EXCLUDED.current_turn,
    timer_ends_at = EXCLUDED.timer_ends_at,
    winner = NULL,
    votes = '{}',
    clues = '{}',
    scores = '{}',
    final_guess = '{}',
    vote_calls = '{}',
    revote_targets = '{}',
    updated_at = NOW();

  UPDATE players SET role = 'imposter' WHERE id = ANY(v_imposter_ids) AND room_id = p_room_id;
  UPDATE players SET role = 'civilian' WHERE id = ANY(v_player_ids) AND id != ALL(v_imposter_ids) AND room_id = p_room_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. advance_phase v3 (spec timers, new scoring, Time's Up auto-clues) ----------------------
CREATE OR REPLACE FUNCTION advance_phase(p_room_id UUID, p_player_id UUID, p_force BOOLEAN DEFAULT false)
RETURNS TABLE (success BOOLEAN, error TEXT, phase VARCHAR(20)) AS $$
DECLARE
  v_gs game_state%ROWTYPE;
  v_room rooms%ROWTYPE;
  v_is_host BOOLEAN;
  v_is_member BOOLEAN;
  v_first_turn UUID;
  v_next_phase VARCHAR(20);
  v_next_timer TIMESTAMPTZ;
  v_player_ids UUID[];
  v_civilian_ids UUID[];
  v_correct_ids UUID[];
  v_other_civ_ids UUID[];
  v_player_count INTEGER;
  v_imposter_count INTEGER;
  v_imposter_ids UUID[];
  v_secret TEXT;
  v_topic_id UUID;
  v_imp_word TEXT;
  v_top_target UUID;
  v_top_count INTEGER;
  v_second_count INTEGER;
  v_tied UUID[];
  v_winner TEXT;
  v_missing UUID[];
  v_pid UUID;
  v_clues JSONB;
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

  IF NOT v_is_host AND NOT p_force AND (v_gs.timer_ends_at IS NULL OR v_gs.timer_ends_at > NOW()) THEN
    RETURN QUERY SELECT false, 'Phase timer still running', v_gs.phase;
    RETURN;
  END IF;

  IF v_gs.phase = 'game_over' THEN
    RETURN QUERY SELECT false, 'Game is over', v_gs.phase;
    RETURN;
  END IF;

  -- role_reveal -> clue -------------------------------------------------------
  IF v_gs.phase = 'role_reveal' THEN
    v_next_phase := 'clue';
    v_next_timer := NOW() + (phase_seconds('clue', v_room.difficulty) || ' seconds')::INTERVAL;
    SELECT id INTO v_first_turn
    FROM players WHERE room_id = p_room_id AND is_connected = true
    ORDER BY joined_at ASC LIMIT 1;
    UPDATE game_state
    SET phase = v_next_phase, timer_ends_at = v_next_timer,
        current_turn = v_first_turn, clues = '{}', updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- clue -> discussion (missing clues become Time's Up) -------------------------
  IF v_gs.phase = 'clue' THEN
    SELECT array_agg(id ORDER BY joined_at) INTO v_player_ids
    FROM players WHERE room_id = p_room_id AND is_connected = true;
    v_clues := COALESCE(v_gs.clues, '{}');
    IF v_player_ids IS NOT NULL THEN
      FOREACH v_pid IN ARRAY v_player_ids LOOP
        IF NOT (v_clues ? v_pid::TEXT) THEN
          v_clues := v_clues || jsonb_build_object(v_pid::TEXT, E'⏰ Time''s Up!');
        END IF;
      END LOOP;
    END IF;
    v_next_phase := 'discussion';
    v_next_timer := NOW() + (phase_seconds('discussion', v_room.difficulty) || ' seconds')::INTERVAL;
    UPDATE game_state
    SET phase = v_next_phase, timer_ends_at = v_next_timer,
        clues = v_clues, vote_calls = '{}', updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- discussion -> voting ---------------------------------------------------------
  IF v_gs.phase = 'discussion' THEN
    v_next_phase := 'voting';
    v_next_timer := NOW() + (phase_seconds('voting', v_room.difficulty) || ' seconds')::INTERVAL;
    UPDATE game_state
    SET phase = v_next_phase, timer_ends_at = v_next_timer,
        votes = '{}', revote_targets = '{}', updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- voting -> result (tally, re-vote, scoring) --------------------------------------
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
      v_winner := 'imposter';
    ELSE
      SELECT COALESCE(MAX(cnt), 0) INTO v_second_count
      FROM (
        SELECT COUNT(*) AS cnt
        FROM jsonb_each_text(v_gs.votes)
        GROUP BY value
        HAVING value != v_top_target::TEXT
      ) rest;

      IF v_top_count = v_second_count AND v_second_count > 0
         AND coalesce(array_length(v_gs.revote_targets, 1), 0) = 0
         AND v_room.difficulty != 'nightmare' THEN
        SELECT array_agg(value::UUID) INTO v_tied
        FROM (
          SELECT value, COUNT(*) AS cnt
          FROM jsonb_each_text(v_gs.votes)
          GROUP BY value
          HAVING COUNT(*) = v_top_count
        ) tied;
        v_next_timer := NOW() + (phase_seconds('voting', v_room.difficulty) || ' seconds')::INTERVAL;
        UPDATE game_state
        SET votes = '{}', revote_targets = v_tied,
            timer_ends_at = v_next_timer, updated_at = NOW()
        WHERE room_id = p_room_id;
        RETURN QUERY SELECT true, NULL::TEXT, 'voting'::VARCHAR(20);
        RETURN;
      END IF;

      IF v_top_count > COALESCE(v_second_count, 0) AND v_top_target = ANY(v_gs.imposter_ids) THEN
        v_winner := 'civilians';
      ELSE
        v_winner := 'imposter';
      END IF;
    END IF;

    SELECT array_agg(id ORDER BY joined_at) INTO v_player_ids
    FROM players WHERE room_id = p_room_id AND is_connected = true;
    SELECT array_agg(id) INTO v_civilian_ids
    FROM unnest(v_player_ids) AS id
    WHERE id != ALL(v_gs.imposter_ids);

    v_next_phase := 'result';
    v_next_timer := NOW() + INTERVAL '8 seconds';
    IF v_winner = 'civilians' THEN
      SELECT array_agg(v.voter::UUID) INTO v_correct_ids
      FROM jsonb_each_text(v_gs.votes) AS v(voter, target)
      WHERE v.target = v_top_target::TEXT;
      SELECT array_agg(id) INTO v_other_civ_ids
      FROM unnest(v_civilian_ids) AS id
      WHERE id != ALL(COALESCE(v_correct_ids, '{}'));
      UPDATE game_state
      SET phase = v_next_phase, timer_ends_at = v_next_timer, winner = v_winner,
          revote_targets = '{}', vote_calls = '{}',
          scores = add_points(add_points(v_gs.scores, v_correct_ids, 10), v_other_civ_ids, 2),
          updated_at = NOW()
      WHERE room_id = p_room_id;
    ELSE
      UPDATE game_state
      SET phase = v_next_phase, timer_ends_at = v_next_timer, winner = v_winner,
          revote_targets = '{}', vote_calls = '{}',
          scores = add_points(v_gs.scores, v_gs.imposter_ids, 15),
          updated_at = NOW()
      WHERE room_id = p_room_id;
    END IF;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- result -> next round role_reveal | game_over ---------------------------------
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

    IF v_room_mode_alias(v_room.mode) = 'double' THEN
      v_imposter_count := CASE WHEN v_player_count >= 10 THEN 3 ELSE 2 END;
    ELSE
      v_imposter_count := CASE WHEN v_player_count >= 8 THEN 2 ELSE 1 END;
    END IF;
    SELECT array_agg(id) INTO v_imposter_ids
    FROM (
      SELECT unnest(v_player_ids) AS id
      ORDER BY random()
      LIMIT v_imposter_count
    ) sub;

    v_secret := pick_secret(v_room.mode, v_room.difficulty, v_room.datasets);
    SELECT id INTO v_topic_id FROM topics
    WHERE word = v_secret AND mode = v_room.mode AND difficulty = v_room.difficulty
    LIMIT 1;
    IF v_topic_id IS NULL THEN
      SELECT id INTO v_topic_id FROM topics WHERE word = v_secret LIMIT 1;
    END IF;

    IF v_room.difficulty IN ('hard', 'expert') OR v_room.mode = 'blind-bluff' THEN
      v_imp_word := pick_imposter_word(v_secret, CASE WHEN v_room.difficulty = 'expert' THEN 'expert' ELSE 'hard' END);
    ELSE
      v_imp_word := NULL;
    END IF;

    UPDATE game_state
    SET phase = 'role_reveal',
        round = v_gs.round + 1,
        secret = v_secret,
        secret_topic_id = v_topic_id,
        imposter_word = v_imp_word,
        imposter_ids = v_imposter_ids,
        current_turn = v_player_ids[1],
        timer_ends_at = NOW() + INTERVAL '5 seconds',
        winner = NULL,
        votes = '{}',
        clues = '{}',
        final_guess = '{}',
        vote_calls = '{}',
        revote_targets = '{}',
        updated_at = NOW()
    WHERE room_id = p_room_id;

    UPDATE rooms SET current_round = v_gs.round + 1 WHERE id = p_room_id;
    UPDATE players SET role = 'imposter' WHERE id = ANY(v_imposter_ids) AND room_id = p_room_id;
    UPDATE players SET role = 'civilian' WHERE id = ANY(v_player_ids) AND id != ALL(v_imposter_ids) AND room_id = p_room_id;

    RETURN QUERY SELECT true, NULL::TEXT, 'role_reveal'::VARCHAR(20);
    RETURN;
  END IF;

  RETURN QUERY SELECT false, 'Nothing to advance', v_gs.phase;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Double-imposter mode alias helper ----------------------------------------------
CREATE OR REPLACE FUNCTION v_room_mode_alias(p_mode VARCHAR(20))
RETURNS TEXT AS $$
BEGIN
  IF p_mode = 'double-imposter' THEN RETURN 'double'; END IF;
  RETURN 'single';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 11. get_my_view v3 (blind mechanic) ---------------------------------------------------
-- Hard/Expert (or blind-bluff mode) imposters are returned role 'civilian'
-- with the alternate word. They are NEVER told they are different.
CREATE OR REPLACE FUNCTION get_my_view(p_room_id UUID, p_player_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_role TEXT;
  v_secret TEXT;
  v_topic_id UUID;
  v_imp_word TEXT;
  v_category TEXT;
  v_hint TEXT;
  v_difficulty TEXT;
  v_mode VARCHAR(20);
  v_blind BOOLEAN;
BEGIN
  SELECT role INTO v_role FROM players WHERE id = p_player_id AND room_id = p_room_id;
  IF v_role IS NULL THEN
    RETURN jsonb_build_object('role', NULL, 'secret', NULL, 'category', NULL, 'hint', NULL, 'difficulty', NULL);
  END IF;

  SELECT difficulty, mode INTO v_difficulty, v_mode FROM rooms WHERE id = p_room_id;
  SELECT secret, secret_topic_id, imposter_word INTO v_secret, v_topic_id, v_imp_word
  FROM game_state WHERE room_id = p_room_id;

  IF v_topic_id IS NOT NULL THEN
    SELECT category, hint INTO v_category, v_hint FROM topics WHERE id = v_topic_id;
  END IF;

  v_blind := (v_difficulty IN ('hard', 'expert') OR v_mode = 'blind-bluff') AND v_imp_word IS NOT NULL;

  IF v_role = 'civilian' THEN
    RETURN jsonb_build_object('role', 'civilian', 'secret', v_secret, 'category', v_category, 'hint', NULL, 'difficulty', v_difficulty);
  END IF;

  IF v_role = 'imposter' THEN
    IF v_blind THEN
      RETURN jsonb_build_object('role', 'civilian', 'secret', v_imp_word, 'category', v_category, 'hint', NULL, 'difficulty', v_difficulty);
    END IF;
    IF v_difficulty = 'easy' OR v_difficulty = 'medium' THEN
      RETURN jsonb_build_object('role', 'imposter', 'secret', NULL, 'category', v_category, 'hint', v_hint, 'difficulty', v_difficulty);
    END IF;
    RETURN jsonb_build_object('role', 'imposter', 'secret', NULL, 'category', v_category, 'hint', NULL, 'difficulty', v_difficulty);
  END IF;

  RETURN jsonb_build_object('role', v_role, 'secret', NULL, 'category', NULL, 'hint', NULL, 'difficulty', v_difficulty);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Column-level protection for both secret columns (idempotent) -----------------------
REVOKE SELECT (secret) ON game_state FROM anon, authenticated;
REVOKE SELECT (imposter_word) ON game_state FROM anon, authenticated;

