"use client";

import { useEffect, useRef } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useClassroomStore } from "@/lib/useClassroomStore";

// Structured blackboard. State is pushed here via the classroom store;
// the board only re-renders when a new WhiteboardState arrives, and it
// flashes briefly so topic transitions are visually obvious.
//
// Layering (in local z, stepped generously to avoid z-fighting on any GPU):
//   -0.05  frame
//    0.00  board
//    0.05  divider
//    0.06  title / persona tag / step texts
//    0.04  formula panel back plate
//    0.05  formula highlight plate
//    0.06  formula text

interface Props {
  position: [number, number, number];
}

const BOARD_W = 9;
const BOARD_H = 3.2;

export function Whiteboard({ position }: Props) {
  const wb = useClassroomStore((s) => s.whiteboard);
  const persona = useClassroomStore((s) => s.persona);

  // Subtle flash when the board changes so topic transitions feel alive.
  const flashRef = useRef(0);
  const boardMatRef = useRef<THREE.MeshStandardMaterial>(null);
  useEffect(() => {
    flashRef.current = 1;
  }, [wb?.ts]);
  useFrame((_, dt) => {
    flashRef.current = Math.max(0, flashRef.current - dt * 2.5);
    if (boardMatRef.current) {
      const base = new THREE.Color("#1f3d2b");
      const flash = new THREE.Color("#3a6f4e");
      boardMatRef.current.color.copy(base).lerp(flash, flashRef.current * 0.6);
    }
  });

  const empty = !wb;
  const title = wb?.title ?? "Awaiting lesson…";
  const steps = wb?.steps ?? [];
  const formula = wb?.formula;

  return (
    <group position={position}>
      {/* Frame (behind, slightly larger) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[BOARD_W + 0.35, BOARD_H + 0.35]} />
        <meshStandardMaterial color="#6b4a2b" />
      </mesh>
      {/* Board */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[BOARD_W, BOARD_H]} />
        <meshStandardMaterial
          ref={boardMatRef}
          color="#1f3d2b"
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Title */}
      <Text
        position={[0, BOARD_H / 2 - 0.35, 0.06]}
        fontSize={0.36}
        color="#f8f4e3"
        anchorX="center"
        anchorY="middle"
        maxWidth={BOARD_W - 0.6}
      >
        {title}
      </Text>

      {persona && (
        <Text
          position={[0, BOARD_H / 2 - 0.72, 0.06]}
          fontSize={0.14}
          color="#9cc6ac"
          anchorX="center"
          anchorY="middle"
        >
          {`${persona.subject} · ${persona.name}`}
        </Text>
      )}

      {/* Divider */}
      <mesh position={[0, BOARD_H / 2 - 0.95, 0.05]}>
        <planeGeometry args={[BOARD_W - 0.6, 0.015]} />
        <meshStandardMaterial color="#cfe8d8" opacity={0.55} transparent />
      </mesh>

      {/* Steps (or placeholder) */}
      {empty ? (
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.18}
          color="#cfe8d8"
          anchorX="center"
          anchorY="middle"
          maxWidth={BOARD_W - 0.8}
        >
          Ask the professor a question to start the lesson.
          {"\n"}The board updates when the topic changes.
        </Text>
      ) : (
        steps.slice(0, 5).map((s, i) => (
          <Text
            key={i}
            position={[-BOARD_W / 2 + 0.5, BOARD_H / 2 - 1.25 - i * 0.28, 0.06]}
            fontSize={0.17}
            color="#eaf7ef"
            anchorX="left"
            anchorY="middle"
            maxWidth={BOARD_W - 1}
          >
            {`${i + 1}.  ${s}`}
          </Text>
        ))
      )}

      {/* Formula panel */}
      {formula && (
        <group position={[0, -BOARD_H / 2 + 0.5, 0]}>
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[BOARD_W - 1.4, 0.55]} />
            <meshStandardMaterial color="#0f2a1d" />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[BOARD_W - 1.2, 0.7]} />
            <meshStandardMaterial color="#fde68a" opacity={0.25} transparent />
          </mesh>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.24}
            color="#fde68a"
            anchorX="center"
            anchorY="middle"
            maxWidth={BOARD_W - 1.6}
          >
            {formula}
          </Text>
        </group>
      )}
    </group>
  );
}
