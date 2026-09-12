-- Phase 15 fix: pick_imposter_word must NEVER return NULL for a real secret,
-- otherwise Hard/Expert silently falls back to telling the deceiver their role.
-- New fallback chain: curated pair (level) -> curated pair (any level) ->
-- same-category different word (same mode) -> any different word (same mode).
-- Run once in the SQL editor. CREATE OR REPLACE = safe to re-run.

CREATE OR REPLACE FUNCTION pick_imposter_word(p_secret TEXT, p_level VARCHAR(10))
RETURNS TEXT AS $$
DECLARE
  v_alt TEXT;
  v_mode VARCHAR(20);
  v_cat TEXT;
BEGIN
  SELECT word_b INTO v_alt
  FROM word_pairs
  WHERE word_a = p_secret AND level = p_level AND active = true
  ORDER BY random()
  LIMIT 1;
  IF v_alt IS NOT NULL THEN RETURN v_alt; END IF;

  SELECT word_b INTO v_alt
  FROM word_pairs
  WHERE word_a = p_secret AND active = true
  ORDER BY random()
  LIMIT 1;
  IF v_alt IS NOT NULL THEN RETURN v_alt; END IF;

  SELECT mode, category INTO v_mode, v_cat
  FROM topics WHERE word = p_secret LIMIT 1;

  IF v_mode IS NOT NULL THEN
    SELECT word INTO v_alt
    FROM topics
    WHERE mode = v_mode AND category = v_cat AND word != p_secret
    ORDER BY random()
    LIMIT 1;
    IF v_alt IS NOT NULL THEN RETURN v_alt; END IF;

    SELECT word INTO v_alt
    FROM topics
    WHERE mode = v_mode AND word != p_secret
    ORDER BY random()
    LIMIT 1;
    IF v_alt IS NOT NULL THEN RETURN v_alt; END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
