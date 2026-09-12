-- Phase 13: Classic+ rules — imposter hints, nightmare level, per-round
-- scoring, tie re-votes, vote calls, final guesses.
-- Run once in the SQL editor. All function changes are CREATE OR REPLACE.

-- 1. Topics: hint column + nightmare difficulty --------------------------------
ALTER TABLE topics ADD COLUMN IF NOT EXISTS hint TEXT;

ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_difficulty_check;
ALTER TABLE topics ADD CONSTRAINT topics_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert', 'nightmare'));

-- Backfill one broad hint per starter topic (imposter intel, never the word).
UPDATE topics SET hint = 'Cheesy fast food' WHERE word = 'Pizza' AND mode = 'classic';
UPDATE topics SET hint = 'Fast food sandwich' WHERE word = 'Burger' AND mode = 'classic';
UPDATE topics SET hint = 'Bat-and-ball sport' WHERE word = 'Cricket' AND mode = 'classic';
UPDATE topics SET hint = 'Goal sport' WHERE word = 'Football' AND mode = 'classic';
UPDATE topics SET hint = 'Morning hot drink' WHERE word = 'Tea' AND mode = 'classic';
UPDATE topics SET hint = 'Caffeine drink' WHERE word = 'Coffee' AND mode = 'classic';
UPDATE topics SET hint = 'Loyal pet' WHERE word = 'Dog' AND mode = 'classic';
UPDATE topics SET hint = 'Independent pet' WHERE word = 'Cat' AND mode = 'classic';
UPDATE topics SET hint = 'Four-wheel ride' WHERE word = 'Car' AND mode = 'classic';
UPDATE topics SET hint = 'Pocket device' WHERE word = 'Phone' AND mode = 'classic';
UPDATE topics SET hint = 'Cinema story' WHERE word = 'Movie' AND mode = 'classic';
UPDATE topics SET hint = 'Music track' WHERE word = 'Song' AND mode = 'classic';
UPDATE topics SET hint = 'Cake day' WHERE word = 'Birthday' AND mode = 'classic';
UPDATE topics SET hint = 'Sky shower' WHERE word = 'Rain' AND mode = 'classic';
UPDATE topics SET hint = 'Sand and waves' WHERE word = 'Beach' AND mode = 'classic';
UPDATE topics SET hint = 'Tall peak' WHERE word = 'Mountain' AND mode = 'classic';
UPDATE topics SET hint = 'Rail journey' WHERE word = 'Train' AND mode = 'classic';
UPDATE topics SET hint = 'Flying machine' WHERE word = 'Aeroplane' AND mode = 'classic';
UPDATE topics SET hint = 'Hospital healer' WHERE word = 'Doctor' AND mode = 'classic';
UPDATE topics SET hint = 'Classroom place' WHERE word = 'School' AND mode = 'classic';
UPDATE topics SET hint = 'Frothy coffee' WHERE word = 'Cappuccino' AND mode = 'classic';
UPDATE topics SET hint = 'Touchscreen phone' WHERE word = 'Smartphone' AND mode = 'classic';
UPDATE topics SET hint = 'Ear audio' WHERE word = 'Headphones' AND mode = 'classic';
UPDATE topics SET hint = 'Shoulder bag' WHERE word = 'Backpack' AND mode = 'classic';
UPDATE topics SET hint = 'String instrument' WHERE word = 'Guitar' AND mode = 'classic';
UPDATE topics SET hint = 'Book hall' WHERE word = 'Library' AND mode = 'classic';
UPDATE topics SET hint = 'History house' WHERE word = 'Museum' AND mode = 'classic';
UPDATE topics SET hint = 'Outdoor meal' WHERE word = 'Picnic' AND mode = 'classic';
UPDATE topics SET hint = 'Marriage party' WHERE word = 'Wedding' AND mode = 'classic';
UPDATE topics SET hint = 'Work desk place' WHERE word = 'Office' AND mode = 'classic';
UPDATE topics SET hint = 'Coffee maker' WHERE word = 'Barista' AND mode = 'classic';
UPDATE topics SET hint = 'Paper art' WHERE word = 'Origami' AND mode = 'classic';
UPDATE topics SET hint = 'Sky dive gear' WHERE word = 'Parachute' AND mode = 'classic';
UPDATE topics SET hint = 'Fever checker' WHERE word = 'Thermometer' AND mode = 'classic';
UPDATE topics SET hint = 'Star gazer' WHERE word = 'Telescope' AND mode = 'classic';
UPDATE topics SET hint = 'Falling river' WHERE word = 'Waterfall' AND mode = 'classic';
UPDATE topics SET hint = 'Sea tower' WHERE word = 'Lighthouse' AND mode = 'classic';
UPDATE topics SET hint = 'Ice house' WHERE word = 'Igloo' AND mode = 'classic';
UPDATE topics SET hint = 'Repeat performance' WHERE word = 'Encore' AND mode = 'classic';
UPDATE topics SET hint = 'Strong coffee shot' WHERE word = 'Espresso' AND mode = 'classic';
UPDATE topics SET hint = 'Kadak morning drink' WHERE word = 'Chai' AND mode = 'desi-life';
UPDATE topics SET hint = 'Gully to stadium sport' WHERE word = 'Cricket' AND mode = 'desi-life';
UPDATE topics SET hint = 'Hindi cinema' WHERE word = 'Bollywood' AND mode = 'desi-life';
UPDATE topics SET hint = 'Three-wheel ride' WHERE word = 'Auto-rickshaw' AND mode = 'desi-life';
UPDATE topics SET hint = 'Baarish season' WHERE word = 'Monsoon' AND mode = 'desi-life';
UPDATE topics SET hint = 'Festival of lights' WHERE word = 'Diwali' AND mode = 'desi-life';
UPDATE topics SET hint = 'Colour festival' WHERE word = 'Holi' AND mode = 'desi-life';
UPDATE topics SET hint = 'Triangular snack' WHERE word = 'Samosa' AND mode = 'desi-life';
UPDATE topics SET hint = 'Train platform place' WHERE word = 'Railway Station' AND mode = 'desi-life';
UPDATE topics SET hint = 'Shaadi function' WHERE word = 'Wedding' AND mode = 'desi-life';
UPDATE topics SET hint = '2-minute noodles' WHERE word = 'Maggi' AND mode = 'desi-life';
UPDATE topics SET hint = 'Campus life' WHERE word = 'College' AND mode = 'desi-life';
UPDATE topics SET hint = 'Half glass tea' WHERE word = 'Cutting Chai' AND mode = 'desi-life';
UPDATE topics SET hint = 'Mumbai lifeline' WHERE word = 'Local Train' AND mode = 'desi-life';
UPDATE topics SET hint = 'Thela snacks' WHERE word = 'Street Food' AND mode = 'desi-life';
UPDATE topics SET hint = 'Student dorm' WHERE word = 'Hostel' AND mode = 'desi-life';
UPDATE topics SET hint = 'Exam prep' WHERE word = 'Coaching Classes' AND mode = 'desi-life';
UPDATE topics SET hint = 'Peak hour jam' WHERE word = 'Traffic Jam' AND mode = 'desi-life';
UPDATE topics SET hint = 'Rishtedaar gathering' WHERE word = 'Family Function' AND mode = 'desi-life';
UPDATE topics SET hint = 'Underground rail' WHERE word = 'Metro' AND mode = 'desi-life';
UPDATE topics SET hint = '10th-12th tension' WHERE word = 'Board Exams' AND mode = 'desi-life';
UPDATE topics SET hint = 'ICC trophy' WHERE word = 'Cricket World Cup' AND mode = 'desi-life';
UPDATE topics SET hint = 'Beach plan' WHERE word = 'Goa Trip' AND mode = 'desi-life';
UPDATE topics SET hint = 'Workplace drama' WHERE word = 'Office Politics' AND mode = 'desi-life';
UPDATE topics SET hint = 'Train booking site' WHERE word = 'IRCTC' AND mode = 'desi-life';
UPDATE topics SET hint = 'Instant payment' WHERE word = 'UPI' AND mode = 'desi-life';
UPDATE topics SET hint = 'Groom procession' WHERE word = 'Baraat' AND mode = 'desi-life';
UPDATE topics SET hint = 'Desi hack' WHERE word = 'Jugaad' AND mode = 'desi-life';
UPDATE topics SET hint = 'Wedding music' WHERE word = 'Shaadi DJ' AND mode = 'desi-life';
UPDATE topics SET hint = 'Paying guest living' WHERE word = 'PG Life' AND mode = 'desi-life';
UPDATE topics SET hint = 'MBA entrance' WHERE word = 'CAT Exam' AND mode = 'desi-life';
UPDATE topics SET hint = 'Lunch box' WHERE word = 'Tiffin Dabba' AND mode = 'desi-life';
UPDATE topics SET hint = 'Fare device' WHERE word = 'Rickshaw Meter' AND mode = 'desi-life';
UPDATE topics SET hint = 'Street match' WHERE word = 'Gully Cricket' AND mode = 'desi-life';
UPDATE topics SET hint = 'Last-minute train ticket' WHERE word = 'Tatkal Booking' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Budget berth' WHERE word = 'Sleeper Class' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Station entry pass' WHERE word = 'Platform Ticket' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Pooled ride' WHERE word = 'Share Auto' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Mumbai burger' WHERE word = 'Vada Pav' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Gujarati sweet-snack' WHERE word = 'Jalebi Fafda' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Neighbourhood' WHERE word = 'Mohalla' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Power cut' WHERE word = 'Load Shedding' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Mystery spin ball' WHERE word = 'Doosra' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Wedding music night' WHERE word = 'Sangeet Night' AND mode = 'desi-expert';
UPDATE topics SET hint = 'Cricket dismissal' WHERE word = 'LBW' AND mode = 'hardcore';
UPDATE topics SET hint = 'Deceptive ball' WHERE word = 'Googly' AND mode = 'hardcore';
UPDATE topics SET hint = 'Toe-crusher ball' WHERE word = 'Yorker' AND mode = 'hardcore';
UPDATE topics SET hint = 'Football rule' WHERE word = 'Offside' AND mode = 'hardcore';
UPDATE topics SET hint = 'Three in a row' WHERE word = 'Hat-trick' AND mode = 'hardcore';
UPDATE topics SET hint = 'Tiebreaker kicks' WHERE word = 'Penalty Shootout' AND mode = 'hardcore';
UPDATE topics SET hint = 'Ring function' WHERE word = 'Engagement Ceremony' AND mode = 'hardcore';
UPDATE topics SET hint = 'Couple photos' WHERE word = 'Pre-wedding Shoot' AND mode = 'hardcore';
UPDATE topics SET hint = 'Tailender shield' WHERE word = 'Night Watchman' AND mode = 'hardcore';
UPDATE topics SET hint = 'TV referee' WHERE word = 'Third Umpire' AND mode = 'hardcore';

-- 2. Game state: scoring, final guesses, re-votes, vote calls, topic link ----
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS scores JSONB NOT NULL DEFAULT '{}';
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS final_guess JSONB NOT NULL DEFAULT '{}';
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS vote_calls JSONB NOT NULL DEFAULT '{}';
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS revote_targets UUID[] NOT NULL DEFAULT '{}';
ALTER TABLE game_state ADD COLUMN IF NOT EXISTS secret_topic_id UUID;

-- 3. Difficulty-driven phase timers (seconds) ------------------------------------
-- Easy 60/90/30 · Normal 45/60/25 · Hard 30/45/20 · Expert 20/30/15 · Nightmare 15/20/10
CREATE OR REPLACE FUNCTION phase_seconds(p_phase TEXT, p_difficulty TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF p_phase = 'role_reveal' THEN RETURN 5; END IF;
  IF p_phase = 'result' THEN RETURN 8; END IF;
  IF p_phase = 'clue' THEN
    RETURN CASE p_difficulty WHEN 'easy' THEN 60 WHEN 'medium' THEN 45 WHEN 'hard' THEN 30 WHEN 'expert' THEN 20 WHEN 'nightmare' THEN 15 ELSE 30 END;
  END IF;
  IF p_phase = 'discussion' THEN
    RETURN CASE p_difficulty WHEN 'easy' THEN 90 WHEN 'medium' THEN 60 WHEN 'hard' THEN 45 WHEN 'expert' THEN 30 WHEN 'nightmare' THEN 20 ELSE 60 END;
  END IF;
  IF p_phase = 'voting' THEN
    RETURN CASE p_difficulty WHEN 'easy' THEN 30 WHEN 'medium' THEN 25 WHEN 'hard' THEN 20 WHEN 'expert' THEN 15 WHEN 'nightmare' THEN 10 ELSE 20 END;
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Score helper: add points to each id ----------------------------------------
CREATE OR REPLACE FUNCTION add_points(p_scores JSONB, p_ids UUID[], p_pts INTEGER)
RETURNS JSONB AS $$
DECLARE
  pid UUID;
  s JSONB := COALESCE(p_scores, '{}');
BEGIN
  IF p_ids IS NULL THEN RETURN s; END IF;
  FOREACH pid IN ARRAY p_ids LOOP
    s := s || jsonb_build_object(pid::TEXT, COALESCE((s ->> pid::TEXT)::INTEGER, 0) + p_pts);
  END LOOP;
  RETURN s;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. start_game v2 (topic link + score reset) -------------------------------------
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
  v_topic_id UUID;
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
  SELECT id INTO v_topic_id FROM topics
  WHERE word = v_secret AND mode = v_room_mode AND difficulty = v_room_difficulty
  LIMIT 1;
  IF v_topic_id IS NULL THEN
    SELECT id INTO v_topic_id FROM topics WHERE word = v_secret LIMIT 1;
  END IF;

  UPDATE rooms SET status = 'playing', current_round = 1 WHERE id = p_room_id;

  INSERT INTO game_state (room_id, phase, round, secret, secret_topic_id, imposter_ids, current_turn, timer_ends_at, winner)
  VALUES (p_room_id, 'role_reveal', 1, v_secret, v_topic_id, v_imposter_ids, v_player_ids[1], NOW() + INTERVAL '5 seconds', NULL)
  ON CONFLICT (room_id) DO UPDATE SET
    phase = 'role_reveal',
    round = 1,
    secret = EXCLUDED.secret,
    secret_topic_id = EXCLUDED.secret_topic_id,
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

-- 6. advance_phase v2 (difficulty timers, scoring, re-vote) -----------------------
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
  v_player_count INTEGER;
  v_imposter_count INTEGER;
  v_imposter_ids UUID[];
  v_secret TEXT;
  v_topic_id UUID;
  v_top_target UUID;
  v_top_count INTEGER;
  v_second_count INTEGER;
  v_tied UUID[];
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

  -- clue -> discussion ---------------------------------------------------------
  IF v_gs.phase = 'clue' THEN
    v_next_phase := 'discussion';
    v_next_timer := NOW() + (phase_seconds('discussion', v_room.difficulty) || ' seconds')::INTERVAL;
    UPDATE game_state
    SET phase = v_next_phase, timer_ends_at = v_next_timer, vote_calls = '{}', updated_at = NOW()
    WHERE room_id = p_room_id;
    RETURN QUERY SELECT true, NULL::TEXT, v_next_phase;
    RETURN;
  END IF;

  -- discussion -> voting (votes + re-vote state reset) --------------------------
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

  -- voting -> result (tally, re-vote on tie, scoring) ----------------------------
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

      -- DEADLOCK: tie at the top -> one re-vote among the tied
      -- (nightmare skips re-votes: the Imposter thrives in chaos).
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
    UPDATE game_state
    SET phase = v_next_phase, timer_ends_at = v_next_timer, winner = v_winner,
        revote_targets = '{}', vote_calls = '{}',
        scores = CASE WHEN v_winner = 'civilians'
          THEN add_points(v_gs.scores, v_civilian_ids, 2)
          ELSE add_points(v_gs.scores, v_gs.imposter_ids, 3) END,
        updated_at = NOW()
    WHERE room_id = p_room_id;
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

    v_imposter_count := CASE WHEN v_player_count >= 8 THEN 2 ELSE 1 END;
    SELECT array_agg(id) INTO v_imposter_ids
    FROM (
      SELECT unnest(v_player_ids) AS id
      ORDER BY random()
      LIMIT v_imposter_count
    ) sub;

    v_secret := pick_secret(v_room.mode, v_room.difficulty);
    SELECT id INTO v_topic_id FROM topics
    WHERE word = v_secret AND mode = v_room.mode AND difficulty = v_room.difficulty
    LIMIT 1;
    IF v_topic_id IS NULL THEN
      SELECT id INTO v_topic_id FROM topics WHERE word = v_secret LIMIT 1;
    END IF;

    UPDATE game_state
    SET phase = 'role_reveal',
        round = v_gs.round + 1,
        secret = v_secret,
        secret_topic_id = v_topic_id,
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

-- 7. get_my_view v2 (category + hint + difficulty) ----------------------------------
-- Imposter intel by difficulty: easy/medium -> category + hint,
-- hard -> category only, expert/nightmare -> nothing.
CREATE OR REPLACE FUNCTION get_my_view(p_room_id UUID, p_player_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_role TEXT;
  v_secret TEXT;
  v_topic_id UUID;
  v_category TEXT;
  v_hint TEXT;
  v_difficulty TEXT;
  v_out_hint TEXT;
  v_out_category TEXT;
BEGIN
  SELECT role INTO v_role FROM players WHERE id = p_player_id AND room_id = p_room_id;
  IF v_role IS NULL THEN
    RETURN jsonb_build_object('role', NULL, 'secret', NULL, 'category', NULL, 'hint', NULL, 'difficulty', NULL);
  END IF;

  SELECT difficulty INTO v_difficulty FROM rooms WHERE id = p_room_id;
  SELECT secret, secret_topic_id INTO v_secret, v_topic_id FROM game_state WHERE room_id = p_room_id;

  IF v_topic_id IS NOT NULL THEN
    SELECT category, hint INTO v_category, v_hint FROM topics WHERE id = v_topic_id;
  END IF;

  IF v_role = 'civilian' THEN
    RETURN jsonb_build_object('role', v_role, 'secret', v_secret, 'category', v_category, 'hint', NULL, 'difficulty', v_difficulty);
  END IF;

  IF v_role = 'imposter' THEN
    IF v_difficulty = 'easy' OR v_difficulty = 'medium' THEN
      v_out_category := v_category;
      v_out_hint := v_hint;
    ELSIF v_difficulty = 'hard' THEN
      v_out_category := v_category;
      v_out_hint := NULL;
    ELSE
      v_out_category := NULL;
      v_out_hint := NULL;
    END IF;
    RETURN jsonb_build_object('role', v_role, 'secret', NULL, 'category', v_out_category, 'hint', v_out_hint, 'difficulty', v_difficulty);
  END IF;

  RETURN jsonb_build_object('role', v_role, 'secret', NULL, 'category', NULL, 'hint', NULL, 'difficulty', v_difficulty);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Re-apply column-level secret protection (idempotent) -----------------------------
REVOKE SELECT (secret) ON game_state FROM anon, authenticated;

