# Virtual Classroom — VAPI + three.js module

A 3D multiplayer classroom where students join a room with a code and talk to
an AI professor (voice + text). This repo is the **voice + 3D game layer**
owned by Kevin. Frontend pages, backend (Insforge/Wundergraph/Redis), database
(Ghost/Tigerdata), and persona RL are owned by the other teams and plug in
through a single `ClassroomNetwork` interface.

## Quick start

```bash
cp .env.example .env.local   # paste your VAPI public key (optional for mock mode)
npm install
npm run dev
```

Open http://localhost:3000 → create a room → drop into `/classroom/<code>`.

No VAPI key? The scene, movement, chat, and a mock "Dr. Chen" persona still
work end-to-end thanks to `src/lib/mockNetwork.ts`. The mic button will
surface a friendly error.

## Controls

| Key | Action |
| --- | ------ |
| `W A S D` / arrows | Move (relative to camera) |
| `Shift` | Run |
| Mouse | Look around (click canvas to lock pointer, `Esc` to release) |
| `T` | Focus chat input |
| Mic button (bottom-right) | Start/stop voice call with the professor |

## Architecture

```
src/
├── app/
│   ├── page.tsx                     landing: create/join room
│   └── classroom/[roomCode]/page.tsx  classroom page (asks for name, mounts root)
├── components/
│   ├── ClassroomRoot.tsx            wires network → store → scene + UI
│   ├── classroom/
│   │   ├── Classroom.tsx            R3F <Canvas>, lights, composes scene
│   │   ├── Room.tsx                 floor/walls/desks/blackboard + room bounds
│   │   ├── Avatar.tsx               shared capsule avatar (imperative handle)
│   │   ├── LocalPlayer.tsx          third-person controller, camera rig
│   │   ├── RemotePlayers.tsx        interpolated remote avatars
│   │   └── Professor.tsx            AI avatar at the front, mouth pulses when speaking
│   └── ui/
│       ├── ChatBox.tsx              text chat overlay
│       └── VoiceControl.tsx         mic button, VAPI lifecycle → store
├── lib/
│   ├── vapi.ts                      VAPI Web SDK wrapper
│   ├── useClassroomStore.ts         zustand store (self, remotes, messages, voice, persona)
│   └── mockNetwork.ts               stub ClassroomNetwork for dev/demo
└── types/
    └── classroom.ts                 PlayerState / ChatMessage / PersonaConfig / ClassroomNetwork
```

### The one integration seam: `ClassroomNetwork`

Everything the 3D/voice client needs from the backend is behind a single
interface in `src/types/classroom.ts`:

```ts
interface ClassroomNetwork {
  join(roomCode, name): Promise<{ selfId }>;
  leave(): void;
  sendPlayerState(state): void;   // called ~15 Hz from LocalPlayer
  sendChat(text): void;
  sendReward(amount, reason?): void;  // RL signal from the client
  onRemotePlayers(cb): () => void;
  onChat(cb): () => void;
  onPersona(cb): () => void;
}
```

Backend team: implement this against Wundergraph/Insforge + Redis pub/sub.
Pass your instance into `<ClassroomRoot network={...} />` (see
`src/app/classroom/[roomCode]/page.tsx`). No changes needed inside the 3D
code.

The mock implementation in `mockNetwork.ts` is a working reference — it shows
expected message shapes, timing of `onPersona`/`onRemotePlayers` fires on join,
and the `sendReward` hook for reinforcement learning.

### Persona + RL

- `PersonaConfig` travels over `onPersona` → zustand store → used by
  `Professor` (color/name) and `VoiceControl` (`systemPrompt` + `voiceId`
  become the VAPI assistant config).
- `ChatBox` already sends a `+1` reward on learner-affirmation phrases
  ("got it", "makes sense", "thanks"). Backend can replace/augment with a
  smarter scorer.
- Persona IDs are stable; the same persona can be reused in other rooms per
  spec.

### VAPI

`src/lib/vapi.ts` wraps `@vapi-ai/web`. On start it assembles a one-shot
assistant config from the current `PersonaConfig`:

- model: `openai/gpt-4o-mini` with `persona.systemPrompt`
- voice: `11labs` / `persona.voiceId` (falls back to `"burt"`)
- transcriber: `deepgram/nova-2`

Events routed into the store:

- `call-start` / `call-end` → `voice.active`
- `speech-start` / `speech-end` → `voice.speaking` drives professor mouth anim
- `volume-level` → `voice.volume` (available for future VU meters)
- `message` (final transcript) → pushed into chat as a `professor` or `user` message

Requires `NEXT_PUBLIC_VAPI_PUBLIC_KEY` at build time.

### Networking math

- Local player broadcasts its pose at ~15 Hz (every 66 ms).
- `RemotePlayers` interpolates between network updates using exponential
  smoothing (`1 - exp(-LERP·dt)`) so motion looks smooth at any frame rate.
- Room bounds are exported from `Room.tsx` so the controller can clamp
  without colliders.

## Known limitations / TODO

- Collision is box-clamp only (no desk collisions). Fine for the demo.
- No proximity voice yet — VAPI is 1:1 with the professor.
- Avatar is a capsule, not a rigged model. Swap in a GLTF later without
  changing the controller (it only needs the imperative `setPose`).
- `sendReward` heuristic is naive; the real RL signal lives in the backend.

## Scripts

```bash
npm run dev      # turbopack dev server
npm run build
npm run start
npx tsc --noEmit # type check
```
