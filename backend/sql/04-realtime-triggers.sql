-- InsForge Realtime: Database triggers for automatic event publishing

-- Trigger: publish new messages to room channel
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'room:' || NEW.room_id::text,
    'new_message',
    jsonb_build_object(
      'id', NEW.id,
      'room_id', NEW.room_id,
      'sender_id', NEW.sender_id,
      'sender_type', NEW.sender_type,
      'content', NEW.content,
      'message_type', NEW.message_type,
      'metadata', NEW.metadata,
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER message_realtime
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger: publish member join/leave events to room channel
CREATE OR REPLACE FUNCTION notify_member_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM realtime.publish(
      'room:' || NEW.room_id::text,
      'member_joined',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'room_id', NEW.room_id,
        'joined_at', NEW.joined_at
      )
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    PERFORM realtime.publish(
      'room:' || NEW.room_id::text,
      'member_left',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'room_id', NEW.room_id,
        'left_at', NEW.left_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER member_realtime
  AFTER INSERT OR UPDATE ON room_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_member_change();

-- Trigger: publish reward events to room channel
CREATE OR REPLACE FUNCTION notify_reward()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.publish(
    'room:' || NEW.room_id::text,
    'reward_granted',
    jsonb_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'topic', NEW.topic,
      'understanding_score', NEW.understanding_score,
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER reward_realtime
  AFTER INSERT ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION notify_reward();
