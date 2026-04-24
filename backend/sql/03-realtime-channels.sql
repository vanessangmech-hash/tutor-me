-- InsForge Realtime: Channel definitions for virtual classroom

-- Room chat channel: all messages, AI responses, join/leave events
INSERT INTO realtime.channels (pattern, description, enabled)
VALUES
  ('room:%', 'Room chat and events (room:<room_id>)', true),
  ('presence:%', 'User presence per room (presence:<room_id>)', true)
ON CONFLICT DO NOTHING;
