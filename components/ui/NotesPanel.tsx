"use client";

import { useClassroomStore } from "@/lib/useClassroomStore";

// 2D overlay panel showing the structured whiteboard state — the
// "study notes" view of the same data rendered in 3D on the board.

export function NotesPanel() {
  const wb = useClassroomStore((s) => s.whiteboard);
  const persona = useClassroomStore((s) => s.persona);

  return (
    <div className="pointer-events-auto w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-black/60 text-white shadow-xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-sm font-medium">Notes</span>
        </div>
        {persona && (
          <span className="text-[10px] uppercase tracking-wider opacity-60">
            {persona.subject}
          </span>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto px-4 py-3 text-sm">
        {!wb ? (
          <div className="py-6 text-center text-xs opacity-60">
            No notes yet. The board fills in when the professor starts a topic.
          </div>
        ) : (
          <>
            <div className="mb-2 text-base font-semibold leading-snug text-amber-300">
              {wb.title}
            </div>

            {wb.formula && (
              <div className="mb-3 rounded-md border border-amber-300/40 bg-amber-300/10 px-3 py-2 font-mono text-[13px] text-amber-200">
                {wb.formula}
              </div>
            )}

            {wb.summary && wb.summary.length > 0 && (
              <div className="mb-2">
                <div className="mb-1 text-[11px] uppercase tracking-wider opacity-60">
                  Key takeaways
                </div>
                <ul className="space-y-1">
                  {wb.summary.map((s, i) => (
                    <li key={i} className="flex gap-2 leading-snug">
                      <span className="opacity-50">›</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {wb.steps && wb.steps.length > 0 && (
              <div>
                <div className="mb-1 text-[11px] uppercase tracking-wider opacity-60">
                  Steps covered
                </div>
                <ol className="space-y-1">
                  {wb.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 leading-snug">
                      <span className="w-4 flex-shrink-0 text-right opacity-50">
                        {i + 1}.
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
