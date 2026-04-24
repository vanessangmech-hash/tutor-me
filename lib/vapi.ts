"use client";

// Minimal wrapper around the VAPI Web SDK.
//
// IMPORTANT: The VAPI SDK (v2.5.x) unconditionally enables Daily's Krisp
// noise-cancellation processor after the call joins:
//
//   // from @vapi-ai/web/vapi.ts, inside start()
//   this.call.updateInputSettings({
//     audio: { processor: { type: "noise-cancellation" } },
//   });
//
// In Next.js 16 + Turbopack, Krisp's WASM/worker often fails to initialize
// (Daily's default mic processor). Use `npm run dev` (webpack) for voice;
// use `npm run dev:turbo` only when you are not testing VAPI/Daily.
//
// When Krisp fails to load you typically see:
//
//   KrispInitError: Cannot read properties of null (reading 'disable')
//   Local audio track ended (<id>): Will retry in 7 seconds.
//   Local audio track ended (<id>): Will retry in 7 seconds.
//   Meeting ended due to ejection: Meeting has ended
//
// The server-side `backgroundSpeechDenoisingPlan` flag does NOT affect
// this — it only configures VAPI's own denoiser, not Daily's client
// processor. To actually keep the mic alive we must override the
// processor AFTER the call joins by reaching into the Daily handle the
// SDK exposes via `getDailyCallObject()`.

import Vapi from "@vapi-ai/web";
import type { ChatMessage, PersonaConfig } from "@/types/classroom";

export type VapiEvent =
  | { type: "call-start" }
  | { type: "call-end" }
  | { type: "speech-start"; role: "user" | "assistant" }
  | { type: "speech-end"; role: "user" | "assistant" }
  | { type: "volume"; level: number }
  | { type: "transcript"; message: ChatMessage }
  | { type: "error"; error: unknown };

export interface VapiClient {
  start(persona: PersonaConfig, history?: ChatMessage[]): Promise<void>;
  stop(): void;
  say(text: string): void;
  // Forward a typed chat message into the active voice call so the
  // professor replies via voice + transcript. Returns true if the
  // message was actually sent (i.e. a call is live), false otherwise.
  sendUserText(text: string): boolean;
  isActive(): boolean;
  on(cb: (e: VapiEvent) => void): () => void;
}

const HISTORY_CAP = 24;

function toOpenAIHistory(
  history: ChatMessage[] | undefined,
): { role: "user" | "assistant"; content: string }[] {
  if (!history?.length) return [];
  return history
    .filter((m) => m.kind === "user" || m.kind === "professor")
    .slice(-HISTORY_CAP)
    .map((m) => ({
      role: m.kind === "professor" ? ("assistant" as const) : ("user" as const),
      content: m.text,
    }));
}

const TEACHING_ADDENDUM = `
You are teaching inside a live virtual classroom. Keep responses concise and conversational (2–4 sentences typically). When you introduce a concrete topic, clearly name it in your first sentence (e.g. "Let's talk about molarity.") — the classroom display extracts topics from your speech. Ask brief Socratic questions to check understanding.`;

// VAPI voice voiceIds that are safe to send under the built-in "vapi"
// provider. The server allowlist has rotated over time; anything not in
// this set routes to OpenAI to avoid a 400 on start.
const VAPI_NATIVE_VOICE_IDS = new Set([
  "Elliot", "Kylie", "Rohan", "Lily", "Savannah", "Hana", "Neha",
  "Cole", "Harry", "Paige", "Spencer", "Leah", "Tara",
]);

const OPENAI_VOICE_IDS = new Set([
  "alloy", "echo", "fable", "onyx", "nova", "shimmer", "marin", "cedar",
]);

type ResolvedVoice =
  | { provider: "vapi"; voiceId: string }
  | { provider: "openai"; voiceId: string };

/** VAPI may send `type: "transcript"` or `transcript[transcriptType='final']`. */
function isClientTranscriptType(type: unknown): boolean {
  if (typeof type !== "string") return false;
  if (type === "transcript") return true;
  return type.startsWith("transcript[");
}

function resolvePersonaVoice(voiceId: string | undefined): ResolvedVoice {
  if (voiceId) {
    if (VAPI_NATIVE_VOICE_IDS.has(voiceId)) {
      return { provider: "vapi", voiceId };
    }
    if (OPENAI_VOICE_IDS.has(voiceId)) {
      return { provider: "openai", voiceId };
    }
    // Unknown voice — fall through to default so VAPI doesn't reject
    // the whole call. Personas can still customize via known IDs.
  }
  // OpenAI "alloy" is the most widely available voice across VAPI
  // accounts and doesn't require extra credentials.
  return { provider: "openai", voiceId: "alloy" };
}

// Daily (Vapi's transport) doesn't tolerate two concurrent sessions in
// one tab. Fast Refresh / React re-mounts can spawn conflicting SDK
// instances that fight over the mic, so we keep exactly one per tab.
let cachedClient: VapiClient | null = null;

export function createVapiClient(publicKey: string): VapiClient {
  if (cachedClient) return cachedClient;

  const vapi = new Vapi(publicKey);
  const listeners = new Set<(e: VapiEvent) => void>();
  const emit = (e: VapiEvent) => listeners.forEach((l) => l(e));
  let callActive = false;

  vapi.on("call-start", () => {
    callActive = true;
    emit({ type: "call-start" });
  });
  vapi.on("call-end", () => {
    callActive = false;
    emit({ type: "call-end" });
  });
  // User / assistant speaking UI comes from `speech-update` client
  // messages (see ClientMessageSpeechUpdate). The legacy `speech-start`
  // / `speech-end` events on Vapi only reflect remote audio levels for
  // the assistant track and never signal the local user.
  vapi.on("volume-level", (level: number) => emit({ type: "volume", level }));
  vapi.on("error", (error: unknown) => {
    console.error("[vapi] error", error);
    emit({ type: "error", error });
  });

  vapi.on("message", (msg: unknown) => {
    const m = msg as {
      type?: string;
      role?: "user" | "assistant";
      status?: "started" | "stopped";
      transcript?: string;
      transcriptType?: "partial" | "final";
    };

    if (m?.type === "speech-update" && m.status && m.role) {
      if (m.status === "started") {
        emit({ type: "speech-start", role: m.role });
      } else if (m.status === "stopped") {
        emit({ type: "speech-end", role: m.role });
      }
      return;
    }

    if (
      isClientTranscriptType(m?.type) &&
      m.transcriptType === "final" &&
      m.transcript?.trim()
    ) {
      const isAssistant = m.role === "assistant";
      emit({
        type: "transcript",
        message: {
          id: crypto.randomUUID(),
          authorId: isAssistant ? "professor" : "voice-user",
          authorName: isAssistant ? "Professor" : "You (voice)",
          text: m.transcript.trim(),
          ts: Date.now(),
          kind: isAssistant ? "professor" : "user",
        },
      });
    }
  });

  // Critical: the SDK enables Daily's `noise-cancellation` (Krisp)
  // processor at stage 7 of its start() flow with a fire-and-forget
  // updateInputSettings call (see node_modules/@vapi-ai/web/dist/vapi.js
  // around line 537). Under Next.js 16 + Turbopack dev, Krisp's WASM
  // worker can't initialize, the local audio track dies, Daily retries
  // it every 7 seconds, and after a few failures the room ejects us:
  //
  //   Local audio track ended (...): Will retry in 7 seconds.
  //   Meeting ended due to ejection: Meeting has ended
  //
  // Listening for `call-start-success` is too late — Krisp has already
  // begun attaching to the live track by then. Instead we hook the
  // earlier `call-start-progress` event and monkey-patch
  // `updateInputSettings` on the raw Daily handle the moment it's
  // created (stage 2), BEFORE the SDK's stage 7 Krisp call runs. Any
  // attempt to set `processor.type = "noise-cancellation"` is rewritten
  // to `"none"` so Krisp never initializes.
  type DailyCall = {
    updateInputSettings: (s: unknown) => Promise<unknown> | unknown;
    setLocalAudio?: (enabled: boolean) => unknown;
    localAudio?: () => boolean;
    on?: (event: string, handler: (payload: unknown) => void) => void;
  };

  const patchedCalls = new WeakSet<DailyCall>();

  const forceProcessorNone = () => {
    try {
      const getter = (vapi as unknown as {
        getDailyCallObject?: () => DailyCall | null;
      }).getDailyCallObject;
      const call = typeof getter === "function" ? getter.call(vapi) : null;
      if (!call) return;
      const p = call.updateInputSettings({
        audio: { processor: { type: "none" } },
      });
      Promise.resolve(p).then(() => {
        try {
          call.setLocalAudio?.(true);
        } catch {
          /* best effort */
        }
      });
    } catch {
      /* ignore */
    }
  };

  const patchDailyCallObject = () => {
    try {
      const getter = (vapi as unknown as {
        getDailyCallObject?: () => DailyCall | null;
      }).getDailyCallObject;
      const call = typeof getter === "function" ? getter.call(vapi) : null;
      if (!call || patchedCalls.has(call)) return;

      const original = call.updateInputSettings.bind(call);
      call.updateInputSettings = (settings: unknown) => {
        const s = settings as {
          audio?: { processor?: { type?: string } };
        };
        const requested = (s?.audio?.processor?.type ?? "").toLowerCase();
        if (requested && requested !== "none") {
          console.log(
            `[vapi] intercepted Daily processor="${requested}" -> "none"`,
          );
          const p = original({
            ...s,
            audio: {
              ...(s.audio ?? {}),
              processor: { type: "none" },
            },
          });
          // The SDK's own Krisp-error recovery (vapi.js:513-528) calls
          // setLocalAudio(true) after updateInputSettings resolves to
          // re-publish the mic track. Since we short-circuit Krisp the
          // error handler never runs, and without this the local audio
          // can stay unpublished — resulting in "agent talks, mic
          // doesn't record."
          Promise.resolve(p).then(() => {
            try {
              call.setLocalAudio?.(true);
            } catch {
              /* best effort */
            }
          });
          return p;
        }
        return original(settings);
      };

      // One-time Daily listeners: Krisp can still flip on after join,
      // or a late SDK microtask can race the monkey-patch.
      const callExt = call as unknown as Record<string, boolean>;
      const listenerKey = "__shipHackKrispListeners";
      if (!callExt[listenerKey] && typeof call.on === "function") {
        callExt[listenerKey] = true;
        call.on("joined-meeting", () => {
          forceProcessorNone();
        });
        call.on("nonfatal-error", (e: unknown) => {
          const err = e as { type?: string };
          if (err?.type === "audio-processor-error") {
            forceProcessorNone();
          }
        });
      }

      patchedCalls.add(call);
      console.log("[vapi] patched Daily updateInputSettings (Krisp guard)");
    } catch (err) {
      console.warn("[vapi] could not patch Daily call object:", err);
    }
  };

  // The SDK emits `call-start-progress` at each stage of its startup.
  // We patch right after `daily-call-object-creation:completed`, which
  // is long before the `audio-processing-setup` stage where Krisp is
  // toggled on. Belt-and-suspenders: also try on `call-start-success`
  // in case the progress event naming changes in a future SDK release.
  (vapi as unknown as {
    on: (ev: string, cb: (...args: unknown[]) => void) => void;
  }).on("call-start-progress", (...args: unknown[]) => {
    const ev = args[0] as { stage?: string; status?: string } | undefined;
    if (
      ev?.stage === "daily-call-object-creation" &&
      ev?.status === "completed"
    ) {
      patchDailyCallObject();
    }
    if (
      ev?.stage === "audio-processing-setup" &&
      ev?.status === "completed"
    ) {
      forceProcessorNone();
    }
  });

  (vapi as unknown as {
    on: (ev: string, cb: (...args: unknown[]) => void) => void;
  }).on("call-start-success", () => {
    patchDailyCallObject();
  });

  const client: VapiClient = {
    async start(persona, history) {
      const prior = toOpenAIHistory(history);
      const isResume = prior.some((m) => m.role === "assistant");

      const systemPrompt = `${persona.systemPrompt}${TEACHING_ADDENDUM}${
        isResume
          ? "\n\nYou are mid-session with this student. Prior turns are in the message history. Do NOT reintroduce yourself. Continue naturally from the last exchange."
          : ""
      }`;

      // Minimal transient-assistant config. Everything beyond
      // model/voice/firstMessage is optional — keep it lean so VAPI
      // doesn't reject the payload on schema changes.
      //
      // NOTE on voice providers: VAPI's server validates voice.provider
      // as a strict lowercase enum ("vapi" | "openai" | "11labs" | ...).
      // Passing "OpenAI" silently falls through to the VapiVoice schema,
      // where the voiceId then fails enum validation and the entire
      // call is rejected with a 400 before the mic ever connects.
      //
      // We prefer the OpenAI voice by default because it ships with
      // every VAPI account (no extra 11labs/PlayHT credentials needed)
      // and doesn't depend on the per-account VapiVoice allowlist,
      // which has rotated voiceIds between API versions.
      const voice = resolvePersonaVoice(persona.voiceId);

      const assistant = {
        name: persona.name,
        firstMessage: isResume
          ? "Alright, let's keep going."
          : `Hi, I'm ${persona.name}. Ready to dive into ${persona.subject}?`,
        model: {
          provider: "openai",
          model: "gpt-4.1",
          messages: [{ role: "system", content: systemPrompt }, ...prior],
        },
        voice,
        // Explicit server-side STT so user speech becomes `transcript`
        // client messages (and the model can answer). VAPI hosts
        // Deepgram on their side — no project Deepgram key required.
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: "en-US" as const,
        },
      };

      // Helpful one-liner when VAPI rejects the payload — without this
      // the SDK only surfaces the error message, not what we sent.
      console.log("[vapi] starting call with", {
        name: assistant.name,
        model: assistant.model.provider + "/" + assistant.model.model,
        voice,
        transcriber: assistant.transcriber,
        priorTurns: prior.length,
        isResume,
      });

      await vapi.start(
        assistant as unknown as Parameters<typeof vapi.start>[0],
      );

      // Belt-and-suspenders: in case the progress event we hook fires
      // before `getDailyCallObject()` is attached on this SDK build,
      // re-patch post-start. The WeakSet guard makes this idempotent.
      patchDailyCallObject();

      // Also make sure the local audio track is actually published
      // after join. If Daily never enabled it (e.g. because we
      // short-circuited Krisp before stage 7 finished wiring things
      // up), the dashboard will see the assistant side fine but the
      // user's mic silent. This is explicitly safe: it's a no-op when
      // audio is already enabled.
      try {
        const getter = (vapi as unknown as {
          getDailyCallObject?: () => {
            setLocalAudio?: (enabled: boolean) => unknown;
            localAudio?: () => boolean;
          } | null;
        }).getDailyCallObject;
        const call =
          typeof getter === "function" ? getter.call(vapi) : null;
        if (call?.setLocalAudio) {
          call.setLocalAudio(true);
          console.log(
            "[vapi] ensured local audio enabled (localAudio=",
            call.localAudio?.(),
            ")",
          );
        }
      } catch (err) {
        console.warn("[vapi] could not enable local audio:", err);
      }
    },
    stop() {
      try {
        vapi.stop();
      } catch {
        // best-effort teardown; ignore errors
      }
      callActive = false;
    },
    say(text) {
      vapi.say(text);
    },
    sendUserText(text) {
      if (!callActive) return false;
      try {
        // VAPI Live Call Control: inject a user message into the
        // running conversation and let the model respond. See
        // https://docs.vapi.ai/calls/call-features
        (vapi as unknown as {
          send: (msg: {
            type: string;
            message: { role: string; content: string };
            triggerResponseEnabled: boolean;
          }) => void;
        }).send({
          type: "add-message",
          message: { role: "user", content: text },
          triggerResponseEnabled: true,
        });
        return true;
      } catch (err) {
        console.warn("[vapi] sendUserText failed:", err);
        return false;
      }
    },
    isActive() {
      return callActive;
    },
    on(cb) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
  };

  cachedClient = client;
  return client;
}
