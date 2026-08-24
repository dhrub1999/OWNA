/** Stand-in for next/font/google under Vitest. See vitest.config.ts. */
type Loaded = { className: string; variable: string; style: { fontFamily: string } };

function loader(options: { variable?: string }): Loaded {
  return {
    className: "font-stub",
    variable: options.variable ?? "--font-stub",
    style: { fontFamily: "stub" },
  };
}

export const Inter = loader;
export const Geist = loader;
export const Geist_Mono = loader;
export const Sora = loader;
export const Outfit = loader;
export const Space_Grotesk = loader;
export const Plus_Jakarta_Sans = loader;
export const Bricolage_Grotesque = loader;
export const Playfair_Display = loader;
export const Instrument_Serif = loader;
export const JetBrains_Mono = loader;
