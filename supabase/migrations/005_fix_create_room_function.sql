-- Patch: fixed ambiguous column reference in create_room_with_code
-- (RETURNING id, code -> RETURNING rooms.id, rooms.code).
-- Run this ONE file in the SQL editor. Safe to run any number of times.

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
  RETURNING rooms.id, rooms.code INTO v_room_id, v_code;

  RETURN QUERY SELECT v_room_id, v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
