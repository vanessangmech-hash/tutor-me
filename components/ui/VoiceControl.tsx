"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useClassroomStore } from "@/lib/useClassroomStore";
import { createVapiClient, type VapiClient } from "@/lib/vapi";
import { synthesizeWhiteboard } from "@/lib/whiteboardSynth";

// Mic button that starts/stops a VAPI voice call with the current persona.
// Emits transcripts into the classroom store as chat messages.

export function VoiceControl() {
  const persona = useClassroomStore((s) => s.persona);
  const pushMessage = useClassroomStore((s) => s.pushMessage);
  const setVoice = useClassroomStore((s) => s.setVoice);
  const setWhiteboard = useClassroomStore((s) => s.setWhiteboard);
  const voice = useClassroomStore((s) => s.voice);

  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<VapiClient | null>(null);

  const publicKey = useMemo(
    () => process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "",
    [],
  );

  // Lazily create client once we have a key.
  useEffect(() => {
    if (!publicKey) return;
    if (!clientRef.current) {
      try {
        clientRef.current = createVapiClient(publicKey);
      } catch (e) {
        setError(String(e));
      }
    }
    const client = clientRef.current;
    if (!client) return;

    const off = client.on((ev) => {
      switch (ev.type) {
        case "call-start":
          setVoice({ active: true });
          // Suppress the mock network's canned chat reply while the
          // real VAPI agent is talking, so the user doesn't get two
          // replies to every typed message.
          useClassroomStore.getState().net?.setAutoReplyEnabled?.(false);
          break;
        case "call-end":
          setVoice({ active: false, speaking: null, volume: 0 });
          useClassroomStore.getState().net?.setAutoReplyEnabled?.(true);
          break;
        case "speech-start":
          setVoice({ speaking: ev.role === "assistant" ? "professor" : "user" });
          break;
        case "speech-end":
          setVoice({ speaking: null });
          break;
        case "volume":
          setVoice({ volume: ev.level });
          break;
        case "transcript": {
          const store = useClassroomStore.getState();
          if (ev.message.kind === "user") {
            // Mirror spoken lines into the same chat pipeline as typed
            // messages (BroadcastChannel + correct authorId/selfName).
            // Do not call pushMessage when net exists — sendChat echoes via onChat.
            if (store.net) {
              store.net.sendChat(ev.message.text);
            } else {
              pushMessage(ev.message);
            }
          } else {
            pushMessage(ev.message);
            // Synthesize a whiteboard update from professor speech. Emit
            // only on real topic changes so the board doesn't flicker.
            const subject = store.persona?.subject;
            const wb = synthesizeWhiteboard(ev.message.text, subject);
            if (wb && wb.title !== store.whiteboard?.title) {
              setWhiteboard(wb);
              store.net?.sendWhiteboard(wb);
            }
          }
          break;
        }
        case "error":
          setError(formatVapiError(ev.error));
          break;
      }
    });
    return () => {
      off();
    };
  }, [publicKey, pushMessage, setVoice, setWhiteboard]);

  const toggle = async () => {
    const client = clientRef.current;
    if (!persona) {
      setError("Persona not loaded yet.");
      return;
    }
    if (!client) {
      setError("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
      return;
    }
    setError(null);
    try {
      if (voice.active) {
        client.stop();
      } else {
        // Pass the running transcript so the professor resumes where it
        // left off instead of re-introducing itself every mic click.
        const history = useClassroomStore.getState().messages;
        await client.start(persona, history);
      }
    } catch (e) {
      setError(formatVapiError(e));
    }
  };

  const active = voice.active;

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      {/* Idle prompt — shown before first activation */}
      {!active && (
        <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          Click mic to talk to {persona?.name ?? "the professor"}
        </div>
      )}

      <div className="relative">
        {/* Pulsing ring when idle */}
        {!active && (
          <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
        )}
        <button
          onClick={toggle}
          className={[
            "relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
            active
              ? "bg-red-500 text-white ring-4 ring-red-300/50"
              : "bg-white text-black hover:scale-105",
          ].join(" ")}
          title={active ? "End voice call" : "Talk to the professor"}
        >
          <MicIcon muted={!active} />
        </button>
      </div>

      {active && (
        <div className="rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">
          {voice.speaking === "professor"
            ? `${persona?.name ?? "Professor"} speaking…`
            : voice.speaking === "user"
            ? "Listening…"
            : "Connected"}
        </div>
      )}
      {error && (
        <div className="max-w-xs rounded bg-red-500/90 px-2 py-1 text-xs text-white">
          {error}
        </div>
      )}
    </div>
  );
}

// VAPI's error payloads are deeply nested and don't have a top-level
// `.message`, so naive `String(err)` yields "[object Object]". This
// walks the common shapes and falls back to JSON so the banner shows
// something actionable.
function formatVapiError(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;

  const e = err as {
    errorMsg?: string;
    message?: unknown;
    error?: { msg?: string; errorMsg?: string; message?: unknown; type?: string };
    type?: string;
  };

  if (typeof e.errorMsg === "string") return e.errorMsg;
  if (typeof e.message === "string") return e.message;
  if (typeof e.error?.msg === "string") return e.error.msg;
  if (typeof e.error?.errorMsg === "string") return e.error.errorMsg;
  if (typeof e.error?.message === "string") return e.error.message;
  if (Array.isArray((e.message as { message?: unknown[] } | undefined)?.message))
    return (e.message as { message: unknown[] }).message.join("; ");
  if (typeof e.type === "string") return `VAPI error: ${e.type}`;

  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

function MicIcon({ muted }: { muted?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth={2}
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      {muted && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}
