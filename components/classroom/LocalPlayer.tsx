"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Avatar, type AvatarHandle } from "./Avatar";
import { ROOM_BOUNDS, DESK_COLLIDERS, PLAYER_RADIUS } from "./Room";
import { useClassroomStore } from "@/lib/useClassroomStore";

// Third-person character controller.
// - WASD / arrow keys: move relative to camera heading.
// - Shift: run.
// - Right-mouse-drag on the canvas rotates the camera yaw/pitch. We
//   deliberately do NOT use pointer-lock: the cursor has to stay free
//   so the user can click the mic button and chat input. Left click is
//   reserved for future interactions (and doesn't hijack the mouse).
// - Camera orbits behind the player at a fixed distance.

const WALK_SPEED = 3.2;
const RUN_SPEED = 6.0;
const TURN_SPEED = 10;
const CAM_DIST = 4.5;
const CAM_HEIGHT = 2.2;

interface Props {
  onLocalPlayerUpdate?: (p: {
    position: [number, number, number];
    rotationY: number;
    anim: "idle" | "walk" | "run";
  }) => void;
  chatInputFocused: boolean;
}

export function LocalPlayer({ onLocalPlayerUpdate, chatInputFocused }: Props) {
  const selfName = useClassroomStore((s) => s.selfName) || "You";
  const avatarRef = useRef<AvatarHandle>(null);

  const pos = useRef(new THREE.Vector3(0, 0, 6));
  const bodyYaw = useRef(Math.PI);
  const anim = useRef<"idle" | "walk" | "run">("idle");
  const camYaw = useRef(Math.PI);
  const camPitch = useRef(0.15);

  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const { camera, gl } = useThree();
  const lastSent = useRef(0);

  useEffect(() => {
    const isMoveKey = (k: string) =>
      ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k);
    const down = (e: KeyboardEvent) => {
      if (chatInputFocused) return;
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = true;
      if (k === "s" || k === "arrowdown") keys.current.s = true;
      if (k === "a" || k === "arrowleft") keys.current.a = true;
      if (k === "d" || k === "arrowright") keys.current.d = true;
      if (k === "shift") keys.current.shift = true;
      if (isMoveKey(k)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = false;
      if (k === "s" || k === "arrowdown") keys.current.s = false;
      if (k === "a" || k === "arrowleft") keys.current.a = false;
      if (k === "d" || k === "arrowright") keys.current.d = false;
      if (k === "shift") keys.current.shift = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [chatInputFocused]);

  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    // Right-click starts a camera-rotate drag. Cursor stays visible the
    // whole time so the user can still click the mic / chat UI.
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const onMouseDown = (e: MouseEvent) => {
      if (chatInputFocused) return;
      if (e.button !== 2) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = "grabbing";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      camYaw.current -= dx * 0.0045;
      camPitch.current = THREE.MathUtils.clamp(
        camPitch.current - dy * 0.0045,
        -0.3,
        0.9,
      );
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      canvas.style.cursor = "";
    };

    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("blur", endDrag);
    return () => {
      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("blur", endDrag);
    };
  }, [gl, chatInputFocused]);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Axis-separated collision: try X move alone, then Z alone. If either
  // axis would hit a desk, cancel just that axis so the player slides
  // along the obstacle instead of stopping dead.
  const collidesAt = (x: number, z: number) => {
    const r = PLAYER_RADIUS;
    for (const c of DESK_COLLIDERS) {
      if (
        x + r > c.minX &&
        x - r < c.maxX &&
        z + r > c.minZ &&
        z - r < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  };

  useFrame((_, dt) => {
    const k = keys.current;
    const fwd = (k.w ? 1 : 0) - (k.s ? 1 : 0);
    const strafe = (k.d ? 1 : 0) - (k.a ? 1 : 0);
    const moving = fwd !== 0 || strafe !== 0;
    const speed = k.shift ? RUN_SPEED : WALK_SPEED;

    if (moving) {
      const cy = Math.cos(camYaw.current);
      const sy = Math.sin(camYaw.current);
      const dx = -sy * fwd + cy * strafe;
      const dz = -cy * fwd + -sy * strafe;
      tmp.set(dx, 0, dz).normalize().multiplyScalar(speed * dt);

      // Wall clamp first, then per-axis desk collision.
      const nextX = THREE.MathUtils.clamp(
        pos.current.x + tmp.x,
        ROOM_BOUNDS.minX,
        ROOM_BOUNDS.maxX,
      );
      if (!collidesAt(nextX, pos.current.z)) {
        pos.current.x = nextX;
      }

      const nextZ = THREE.MathUtils.clamp(
        pos.current.z + tmp.z,
        ROOM_BOUNDS.minZ,
        ROOM_BOUNDS.maxZ,
      );
      if (!collidesAt(pos.current.x, nextZ)) {
        pos.current.z = nextZ;
      }

      // Only update body yaw if we actually moved so we don't spin in
      // place while pressed against a desk.
      const moveLenSq = tmp.x * tmp.x + tmp.z * tmp.z;
      if (moveLenSq > 1e-6) {
        const targetYaw = Math.atan2(tmp.x, tmp.z);
        let delta = targetYaw - bodyYaw.current;
        while (delta > Math.PI) delta -= 2 * Math.PI;
        while (delta < -Math.PI) delta += 2 * Math.PI;
        bodyYaw.current += delta * Math.min(1, TURN_SPEED * dt);
      }
      anim.current = k.shift ? "run" : "walk";
    } else {
      anim.current = "idle";
    }

    // Drive avatar imperatively so we avoid re-renders.
    avatarRef.current?.setPose({
      position: [pos.current.x, pos.current.y, pos.current.z],
      rotationY: bodyYaw.current,
      anim: anim.current,
    });

    // Camera follow.
    const px = pos.current.x;
    const pz = pos.current.z;
    const cy = Math.cos(camYaw.current);
    const sy = Math.sin(camYaw.current);
    const pitchLift = Math.sin(camPitch.current) * CAM_DIST;
    camera.position.set(px + sy * CAM_DIST, CAM_HEIGHT + pitchLift, pz + cy * CAM_DIST);
    camera.lookAt(px, 1.4, pz);

    const now = performance.now();
    if (now - lastSent.current > 66 && onLocalPlayerUpdate) {
      lastSent.current = now;
      onLocalPlayerUpdate({
        position: [pos.current.x, pos.current.y, pos.current.z],
        rotationY: bodyYaw.current,
        anim: anim.current,
      });
    }
  });

  return (
    <Avatar
      ref={avatarRef}
      position={[0, 0, 6]}
      rotationY={Math.PI}
      color="#fbbf24"
      name={selfName}
      anim="idle"
    />
  );
}
