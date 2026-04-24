"use client";

import { useEffect, useRef, useState } from "react";
import { useClassroomStore } from "@/lib/useClassroomStore";
import { createVapiClient } from "@/lib/vapi";

interface Props {
  onFocusChange?: (focused: boolean) => void;
}

// In-world chat overlay. Press "T" to focus input, Esc to blur.
// Messages from the network (and VAPI transcripts) show here.

export function ChatBox({ onFocusChange }: Props) {
  const messages = useClassroomStore((s) => s.messages);
  const persona = useClassroomStore((s) => s.persona);
  const net = useClassroomStore((s) => s.net);
  const voiceActive = useClassroomStore((s) => s.voice.active);

  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onFocusChange?.(focused);
  }, [focused, onFocusChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (focused) return;
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;

    // Broadcast + echo locally via the classroom network (also produces
    // the canned demo reply when VAPI is offline).
    net?.sendChat(v);
    setText("");

    // If a voice call is active, forward the typed text into the VAPI
    // session so the professor actually responds to it (via voice +
    // transcript, which appears back in this chat automatically).
    try {
      const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
      if (key) {
        const client = createVapiClient(key);
        if (client.isActive()) client.sendUserText(v);
      }
    } catch {
      // Non-fatal: fall back to the mock reply path.
    }

    // Quick heuristic reward: if the user types something like "got it"
    // or "makes sense", nudge the RL reward. The real scoring will live
    // on the backend but this is a fast demo hook.
    if (/(?:\bgot it\b|\bmakes sense\b|\bi (?:get|understand) it\b|thanks!?)/i.test(v)) {
      net?.sendReward(1, "learner-affirmation");
    }
  };

  return (
    <div className="pointer-events-auto w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-black/60 text-white shadow-xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium">
            {persona ? `${persona.name} • ${persona.subject}` : "Classroom chat"}
          </span>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-xs opacity-70 hover:opacity-100"
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>
      {!collapsed && (
        <>
          <div
            ref={listRef}
            className="max-h-64 overflow-y-auto px-3 py-2 text-sm"
          >
            {messages.length === 0 && (
              <div className="py-4 text-center text-xs opacity-60">
                Say hi to your professor. Press T to chat.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className="mb-2 leading-snug">
                <span
                  className={
                    m.kind === "professor"
                      ? "font-semibold text-amber-300"
                      : m.kind === "system"
                      ? "font-semibold text-sky-300"
                      : "font-semibold text-emerald-300"
                  }
                >
                  {m.authorName}:
                </span>{" "}
                <span className="opacity-95">{m.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-2">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") inputRef.current?.blur();
              }}
              placeholder={
                focused
                  ? voiceActive
                    ? "Type — professor will reply via voice…"
                    : "Type a message…"
                  : "Press T to chat (or click here)"
              }
              className="flex-1 rounded-md bg-white/10 px-3 py-2 text-sm outline-none placeholder:opacity-50 focus:bg-white/20"
            />
            <button
              type="submit"
              className="rounded-md bg-amber-400 px-3 py-2 text-sm font-medium text-black hover:bg-amber-300"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
