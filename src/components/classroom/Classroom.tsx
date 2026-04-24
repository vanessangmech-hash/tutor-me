"use client";

import { Canvas } from "@react-three/fiber";
import { Sky, ContactShadows } from "@react-three/drei";
import { Suspense, useState } from "react";
import { Room, BLACKBOARD_POSITION } from "./Room";
import { LocalPlayer } from "./LocalPlayer";
import { RemotePlayers } from "./RemotePlayers";
import { Professor } from "./Professor";
import { Whiteboard } from "./Whiteboard";
import { useClassroomStore } from "@/lib/useClassroomStore";

interface Props {
  chatInputFocused: boolean;
}

export function Classroom({ chatInputFocused }: Props) {
  const net = useClassroomStore((s) => s.net);
  const [hudHint, setHudHint] = useState(true);

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [0, 2.2, 10], fov: 60 }}
        onPointerDown={() => setHudHint(false)}
      >
        <color attach="background" args={["#0b0b12"]} />
        <fog attach="fog" args={["#0b0b12", 15, 40]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          castShadow
          position={[5, 8, 3]}
          intensity={1.1}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Sky sunPosition={[100, 20, 100]} />

        <Suspense fallback={null}>
          <Room />
          <Whiteboard position={BLACKBOARD_POSITION} />
          <Professor />
          <RemotePlayers />
          <LocalPlayer
            chatInputFocused={chatInputFocused}
            onLocalPlayerUpdate={(p) => net?.sendPlayerState(p)}
          />
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.35}
            scale={30}
            blur={2.5}
            far={6}
          />
        </Suspense>
      </Canvas>
      {hudHint && (
        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
          WASD to move • Shift to run • Right-click & drag to look • T to chat
        </div>
      )}
    </div>
  );
}
