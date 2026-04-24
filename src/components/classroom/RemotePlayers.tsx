"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Avatar, type AvatarHandle } from "./Avatar";
import { useClassroomStore } from "@/lib/useClassroomStore";
import type { PlayerState } from "@/types/classroom";

// Renders all remote players and smoothly interpolates their positions
// toward the latest networked values so motion looks good at 15 Hz updates.

const LERP = 12; // higher = snappier

interface RemoteSlot {
  handle: AvatarHandle | null;
  target: THREE.Vector3;
  current: THREE.Vector3;
  targetYaw: number;
  currentYaw: number;
  anim: "idle" | "walk" | "run";
}

export function RemotePlayers() {
  const remotes = useClassroomStore((s) => s.remotePlayers);
  const slotsRef = useRef<Map<string, RemoteSlot>>(new Map());

  useEffect(() => {
    const slots = slotsRef.current;
    // Update targets; keep current where it is so the lerp smooths it.
    const seen = new Set<string>();
    for (const p of remotes) {
      seen.add(p.id);
      const existing = slots.get(p.id);
      if (existing) {
        existing.target.set(p.position[0], p.position[1], p.position[2]);
        existing.targetYaw = p.rotationY;
        existing.anim = p.anim ?? "idle";
      } else {
        slots.set(p.id, {
          handle: null,
          target: new THREE.Vector3(...p.position),
          current: new THREE.Vector3(...p.position),
          targetYaw: p.rotationY,
          currentYaw: p.rotationY,
          anim: p.anim ?? "idle",
        });
      }
    }
    // Drop slots whose player left.
    for (const id of Array.from(slots.keys())) {
      if (!seen.has(id)) slots.delete(id);
    }
  }, [remotes]);

  useFrame((_, dt) => {
    const slots = slotsRef.current;
    const alpha = 1 - Math.exp(-LERP * dt);
    for (const slot of slots.values()) {
      slot.current.lerp(slot.target, alpha);
      let d = slot.targetYaw - slot.currentYaw;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      slot.currentYaw += d * alpha;
      slot.handle?.setPose({
        position: [slot.current.x, slot.current.y, slot.current.z],
        rotationY: slot.currentYaw,
        anim: slot.anim,
      });
    }
  });

  return (
    <>
      {remotes.map((p) => (
        <RemoteSlotView key={p.id} player={p} slotsRef={slotsRef} />
      ))}
    </>
  );
}

function RemoteSlotView({
  player,
  slotsRef,
}: {
  player: PlayerState;
  slotsRef: React.RefObject<Map<string, RemoteSlot>>;
}) {
  const avatarRef = useRef<AvatarHandle>(null);
  useEffect(() => {
    const slot = slotsRef.current?.get(player.id);
    if (slot) slot.handle = avatarRef.current;
    return () => {
      const s = slotsRef.current?.get(player.id);
      if (s) s.handle = null;
    };
  }, [player.id, slotsRef]);

  return (
    <Avatar
      ref={avatarRef}
      position={player.position}
      rotationY={player.rotationY}
      color={player.color ?? "#7dd3fc"}
      name={player.name}
      anim={player.anim ?? "idle"}
    />
  );
}
