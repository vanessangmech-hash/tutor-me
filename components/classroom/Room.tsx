"use client";

import { useMemo } from "react";

// Low-poly classroom: floor, walls, rows of desks. The blackboard itself
// is rendered separately by <Whiteboard /> so it can react to live
// professor messages without re-mounting the room.
// Dimensions are in meters. Room is centered at the origin on the floor.

const ROOM_W = 16;
const ROOM_D = 20;
const ROOM_H = 4;

// Player radius used for collider inflation — the controller treats
// avatars as cylinders of this radius.
export const PLAYER_RADIUS = 0.4;

// Where the whiteboard hangs on the back wall. Pushed out from the wall
// enough to keep the frame plane from z-fighting with it.
export const BLACKBOARD_POSITION: [number, number, number] = [
  0,
  2.1,
  -ROOM_D / 2 + 0.25,
];

// Axis-aligned box colliders used by LocalPlayer for movement.
// Each entry is the XZ bounds of a solid object at floor level.
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Desk layout — 3 columns x 4 rows of student desks + professor's desk.
// Kept as data so Room and the controller render from the same source.
const STUDENT_DESK_W = 1.6;
const STUDENT_DESK_D = 0.8;
const PROF_DESK_W = 3;
const PROF_DESK_D = 1.2;

const STUDENT_DESK_POSITIONS: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  const cols = [-4, 0, 4];
  const rows = [-2, 1, 4, 7];
  for (const x of cols) for (const z of rows) out.push([x, 0, z]);
  return out;
})();

const PROF_DESK_POSITION: [number, number, number] = [0, 0, -ROOM_D / 2 + 3];

// Solid desk colliders — the controller does axis-separated AABB checks
// against these every frame so you bump into them instead of clipping.
export const DESK_COLLIDERS: AABB[] = [
  ...STUDENT_DESK_POSITIONS.map(([x, , z]) => ({
    minX: x - STUDENT_DESK_W / 2,
    maxX: x + STUDENT_DESK_W / 2,
    minZ: z - STUDENT_DESK_D / 2,
    maxZ: z + STUDENT_DESK_D / 2,
  })),
  {
    minX: PROF_DESK_POSITION[0] - PROF_DESK_W / 2,
    maxX: PROF_DESK_POSITION[0] + PROF_DESK_W / 2,
    minZ: PROF_DESK_POSITION[2] - PROF_DESK_D / 2,
    maxZ: PROF_DESK_POSITION[2] + PROF_DESK_D / 2,
  },
];

export function Room() {
  const desks = useMemo(() => STUDENT_DESK_POSITIONS, []);

  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#d9cbb0" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_H, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, ROOM_H / 2, -ROOM_D / 2]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color="#e8e0cc" />
      </mesh>

      {/* Front wall */}
      <mesh
        position={[0, ROOM_H / 2, ROOM_D / 2]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color="#e8e0cc" />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-ROOM_W / 2, ROOM_H / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial color="#efe6d1" />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[ROOM_W / 2, ROOM_H / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial color="#efe6d1" />
      </mesh>

      {/* Student desks */}
      {desks.map((p, i) => (
        <Desk key={i} position={p} w={STUDENT_DESK_W} d={STUDENT_DESK_D} />
      ))}

      {/* Professor's desk */}
      <Desk position={PROF_DESK_POSITION} w={PROF_DESK_W} d={PROF_DESK_D} />
    </group>
  );
}

function Desk({
  position,
  w,
  d,
}: {
  position: [number, number, number];
  w: number;
  d: number;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[w, 0.08, d]} />
        <meshStandardMaterial color="#8b5e34" />
      </mesh>
      {[
        [-w / 2 + 0.05, 0.38, -d / 2 + 0.05],
        [w / 2 - 0.05, 0.38, -d / 2 + 0.05],
        [-w / 2 + 0.05, 0.38, d / 2 - 0.05],
        [w / 2 - 0.05, 0.38, d / 2 - 0.05],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color="#5b3a1e" />
        </mesh>
      ))}
    </group>
  );
}

export const ROOM_BOUNDS = {
  minX: -ROOM_W / 2 + 0.6,
  maxX: ROOM_W / 2 - 0.6,
  minZ: -ROOM_D / 2 + 0.6,
  maxZ: ROOM_D / 2 - 0.6,
};
