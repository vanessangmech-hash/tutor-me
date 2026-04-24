"use client";

import { useClassroomStore } from "@/lib/useClassroomStore";
import { Avatar } from "./Avatar";

// The AI professor. Position is fixed near the blackboard. The "speaking"
// state comes from the voice/chat store.

export function Professor() {
  const persona = useClassroomStore((s) => s.persona);
  const speakingVoice = useClassroomStore((s) => s.voice.speaking);

  const name = persona?.name ?? "Professor";
  const color = persona?.avatarColor ?? "#a78bfa";
  const speaking = speakingVoice === "professor";

  return (
    <Avatar
      position={[0, 0, -8]}
      rotationY={Math.PI} // face the students
      color={color}
      name={name}
      speaking={speaking}
      labelColor="#fde68a"
      anim="idle"
    />
  );
}
