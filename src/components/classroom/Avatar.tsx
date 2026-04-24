"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// A capsule-body avatar. Used for local player, remotes, and the professor.
// Two ways to drive it:
//  1. Reactive props (`position`, `rotationY`, `anim`, `speaking`) — good for
//     remote players where state arrives via React state updates.
//  2. Imperative handle (`ref.current.setPose(...)`) — good for the local
//     player where position changes every frame and we don't want re-renders.

export interface AvatarHandle {
  setPose(pose: {
    position: [number, number, number];
    rotationY: number;
    anim?: "idle" | "walk" | "run";
    speaking?: boolean;
  }): void;
}

export interface AvatarProps {
  position: [number, number, number];
  rotationY: number;
  color?: string;
  name?: string;
  anim?: "idle" | "walk" | "run";
  speaking?: boolean;
  labelColor?: string;
}

export const Avatar = forwardRef<AvatarHandle, AvatarProps>(function Avatar(
  {
    position,
    rotationY,
    color = "#7dd3fc",
    name,
    anim = "idle",
    speaking = false,
    labelColor = "#ffffff",
  },
  outerRef,
) {
  const group = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);

  // Live pose. Seeded from props so imperative callers can take over later.
  const pose = useRef({
    position,
    rotationY,
    anim,
    speaking,
  });
  // Keep prop-driven updates flowing when not being imperatively controlled.
  pose.current.position = position;
  pose.current.rotationY = rotationY;
  pose.current.anim = anim;
  pose.current.speaking = speaking;

  useImperativeHandle(outerRef, () => ({
    setPose(p) {
      pose.current.position = p.position;
      pose.current.rotationY = p.rotationY;
      if (p.anim) pose.current.anim = p.anim;
      if (p.speaking !== undefined) pose.current.speaking = p.speaking;
    },
  }));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { position: p, rotationY: r, anim: a, speaking: s } = pose.current;
    if (group.current) {
      const bob =
        a === "walk" ? Math.sin(t * 8) * 0.05 :
        a === "run" ? Math.sin(t * 12) * 0.09 : 0;
      group.current.position.set(p[0], p[1] + bob, p[2]);
      group.current.rotation.y = r;
    }
    const swing =
      a === "walk" ? Math.sin(t * 8) * 0.6 :
      a === "run" ? Math.sin(t * 12) * 1.0 : 0;
    if (leftArm.current) leftArm.current.rotation.x = swing;
    if (rightArm.current) rightArm.current.rotation.x = -swing;

    if (mouth.current) {
      const v = s ? 1 + Math.sin(t * 18) * 0.6 : 1;
      mouth.current.scale.y = Math.max(0.3, v);
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh castShadow position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.28, 0.7, 6, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f3d7bd" />
      </mesh>
      <mesh position={[-0.07, 1.68, 0.19]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.07, 1.68, 0.19]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh ref={mouth} position={[0, 1.55, 0.2]}>
        <boxGeometry args={[0.09, 0.02, 0.01]} />
        <meshStandardMaterial color="#7a2e2e" />
      </mesh>
      <mesh ref={leftArm} position={[-0.33, 1.15, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={rightArm} position={[0.33, 1.15, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.13, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>
      <mesh position={[0.13, 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>

      {name ? (
        <Text
          position={[0, 2.1, 0]}
          fontSize={0.18}
          color={labelColor}
          outlineWidth={0.01}
          outlineColor="#000"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      ) : null}
    </group>
  );
});
