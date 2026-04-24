// Keyword-based whiteboard synthesizer. Used in two places:
//  1. mockNetwork — generates a whiteboard after typed chat for demo parity.
//  2. VoiceControl — runs over each final professor transcript so the
//     board updates as the real agent talks (without needing VAPI tools).
// When a real LLM / server-side extractor lands, drop this and route
// updates through ClassroomNetwork.sendWhiteboard directly.

import type { WhiteboardState } from "@/types/classroom";

interface TopicTemplate {
  match: RegExp;
  wb: Omit<WhiteboardState, "ts">;
}

const TOPIC_LIBRARY: TopicTemplate[] = [
  {
    match: /\b(molar(ity)?|concentration|mol\/l|mol per liter)\b/,
    wb: {
      title: "Molarity",
      steps: [
        "Definition of molarity",
        "Formula explanation",
        "Example calculation",
      ],
      formula: "M = moles / liters",
      summary: ["Measures concentration", "Unit is mol/L"],
    },
  },
  {
    match: /\b(ionic|covalent|bond|bonds|bonding)\b/,
    wb: {
      title: "Chemical Bonds",
      steps: [
        "Ionic vs covalent bonds",
        "Electronegativity differences",
        "Examples of each type",
      ],
      summary: [
        "Ionic = transfer of electrons",
        "Covalent = sharing of electrons",
      ],
    },
  },
  {
    match: /\b(atoms?|electrons?|shells?|orbitals?|valence|protons?|neutrons?|nucleus|nuclei)\b/,
    wb: {
      title: "Atomic Structure",
      steps: [
        "Protons, neutrons, electrons",
        "Electron shells and orbitals",
        "Valence electrons",
      ],
      summary: [
        "Atoms have a dense nucleus",
        "Electrons occupy quantized shells",
      ],
    },
  },
  {
    match: /\b(stoichiom|balance|balancing|mole ratio|limiting reagent)\b/,
    wb: {
      title: "Stoichiometry",
      steps: [
        "Balancing chemical equations",
        "Mole ratios",
        "Limiting reagents",
      ],
      formula: "a·A + b·B → c·C + d·D",
      summary: ["Conservation of mass", "Coefficients give mole ratios"],
    },
  },
  {
    match: /\b(acid|base|ph|hydrogen ion|buffer)\b/,
    wb: {
      title: "Acids and Bases",
      steps: [
        "Definitions (Brønsted–Lowry)",
        "pH scale",
        "Neutralization reactions",
      ],
      formula: "pH = −log[H⁺]",
      summary: ["pH < 7 acidic, > 7 basic", "Acids donate H⁺ ions"],
    },
  },
  {
    match: /\b(gas law|ideal gas|pv\s*=\s*nrt|pressure|volume)\b/,
    wb: {
      title: "Ideal Gas Law",
      steps: [
        "Variables: P, V, n, T",
        "The equation PV = nRT",
        "Worked example",
      ],
      formula: "PV = nRT",
      summary: ["Relates pressure, volume, moles, temperature", "R is the gas constant"],
    },
  },
  {
    match: /\b(derivative|differentiat|slope|tangent)\b/,
    wb: {
      title: "Derivatives",
      steps: [
        "Slope as a limit",
        "Power rule",
        "Chain rule",
      ],
      formula: "f'(x) = lim h→0 (f(x+h) − f(x)) / h",
      summary: ["Instantaneous rate of change", "Chain rule for composite functions"],
    },
  },
  {
    match: /\b(integral|integrat|antiderivative|area under)\b/,
    wb: {
      title: "Integrals",
      steps: [
        "Antiderivatives",
        "Fundamental theorem of calculus",
        "Definite vs indefinite",
      ],
      formula: "∫ f(x) dx",
      summary: ["Accumulation / area under curve", "Inverse of differentiation"],
    },
  },
];

// Returns a WhiteboardState ONLY when the text matches a known topic in
// the library. Used to drive the 3D board + Notes panel. We intentionally
// do NOT fall back to "guess a title from the first few words" — that
// produced boards titled "I need help" from user questions, and the mock
// chat template echoed that back as the lesson topic. Callers should
// treat null as "no confident topic change" and leave the board alone.
export function synthesizeWhiteboard(
  text: string,
  // Kept for API compatibility; currently unused.
  _subject?: string,
): WhiteboardState | null {
  if (!text || text.length < 3) return null;
  const lower = text.toLowerCase();
  for (const t of TOPIC_LIBRARY) {
    if (t.match.test(lower)) {
      return { ...t.wb, ts: Date.now() };
    }
  }
  return null;
}
