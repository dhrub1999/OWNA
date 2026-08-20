import { describe, expect, it } from "vitest";
import { parseLayout, parseTheme, themeSchema } from "@/lib/themes/schema";
import { themeToCssVars } from "@/lib/themes/to-css-vars";
import { PRESET_SWATCHES, THEME_PRESETS, resolvePreset } from "@/lib/themes/presets";
import { contrastRatio, WCAG_AA_NORMAL } from "@/lib/themes/contrast";

describe("theme schema", () => {
  it("turns an empty object into a complete theme", () => {
    // This is why profiles.theme can default to '{}' in the database: the
    // defaults live in one place, here.
    const theme = parseTheme({});
    expect(theme.colors.background).toBe("#ffffff");
    expect(theme.typography.headingFont).toBe("inter");
    expect(theme.background.kind).toBe("solid");
  });

  it("falls back per field rather than failing the whole theme", () => {
    const theme = parseTheme({
      colors: { background: "not-a-colour", accent: "#ff0000" },
    });
    expect(theme.colors.background).toBe("#ffffff");
    expect(theme.colors.accent).toBe("#ff0000");
  });

  it("clamps numbers instead of rejecting them", () => {
    const theme = parseTheme({
      typography: { scale: 99 },
      radius: { base: -40 },
      spacing: { block: 100000 },
    });
    expect(theme.typography.scale).toBe(1.6);
    expect(theme.radius.base).toBe(0);
    expect(theme.spacing.block).toBe(120);
  });

  it("refuses a colour that is not a hex value", () => {
    // The narrow format is what makes the contrast maths exact and makes it
    // impossible for a colour to smuggle in extra CSS.
    const theme = parseTheme({
      colors: { foreground: "red; background: url(//evil.example)" },
    });
    expect(theme.colors.foreground).toBe("#0f0f10");
  });

  it("survives a completely malformed background", () => {
    const theme = parseTheme({ background: { kind: "wormhole" } });
    expect(theme.background.kind).toBe("solid");
  });
});

describe("theme to CSS variables", () => {
  const layout = parseLayout({});

  it("emits every custom property the stylesheet reads", () => {
    const vars = themeToCssVars(parseTheme({}), layout);
    for (const name of [
      "--p-bg",
      "--p-fg",
      "--p-accent",
      "--p-font-heading",
      "--p-font-body",
      "--p-radius",
      "--p-gap",
      "--p-width",
      "--p-page-image",
      "--p-text-base",
    ]) {
      expect(vars[name as `--${string}`]).toBeDefined();
    }
  });

  it("scales headings more aggressively than body copy", () => {
    const big = themeToCssVars(parseTheme({ typography: { scale: 1.5 } }), layout);
    const base = themeToCssVars(parseTheme({}), layout);

    const grew = (name: string) =>
      Number.parseFloat(big[name as `--${string}`]) /
      Number.parseFloat(base[name as `--${string}`]);

    expect(grew("--p-text-3xl")).toBeCloseTo(1.5, 2);
    // Body text at 1.5x would be unreadable, so it takes 40% of the multiplier.
    expect(grew("--p-text-base")).toBeCloseTo(1.2, 2);
  });

  it("never lets a hostile background URL reach a url()", () => {
    const vars = themeToCssVars(
      parseTheme({
        background: { kind: "image", url: 'javascript:alert(1)' },
      }),
      layout,
    );
    expect(vars["--p-page-image"]).toBe("none");
  });

  it("drops an image URL carrying characters that could close the url() token", () => {
    const vars = themeToCssVars(
      parseTheme({
        background: {
          kind: "image",
          url: 'https://x.example/a.png");background:url("//evil.example/b.png',
        },
      }),
      layout,
    );
    expect(vars["--p-page-image"]).not.toContain("evil.example");
  });

  it("builds a gradient from validated colours only", () => {
    const vars = themeToCssVars(
      parseTheme({
        background: { kind: "gradient", from: "#112233", to: "#445566", angle: 90 },
      }),
      layout,
    );
    expect(vars["--p-page-image"]).toBe("linear-gradient(90deg, #112233, #445566)");
  });
});

describe("presets", () => {
  it("all ten parse into complete themes", () => {
    expect(THEME_PRESETS).toHaveLength(10);
    for (const preset of THEME_PRESETS) {
      expect(() => themeSchema.parse(preset.theme)).not.toThrow();
      expect(() => resolvePreset(preset.id)).not.toThrow();
    }
  });

  it("every preset clears AA for body text on its own background", () => {
    // A preset that ships failing contrast would make the editor's warning fire
    // on an untouched theme, which trains people to ignore it.
    for (const preset of THEME_PRESETS) {
      const swatch = PRESET_SWATCHES[preset.id];
      const ratio = contrastRatio(swatch.foreground, swatch.background);
      expect(
        ratio,
        `${preset.name}: ${swatch.foreground} on ${swatch.background}`,
      ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    }
  });

  it("every preset clears AA for button text on its buttons", () => {
    for (const preset of THEME_PRESETS) {
      const { theme } = resolvePreset(preset.id);
      const ratio = contrastRatio(
        theme.colors.buttonForeground,
        theme.colors.button,
      );
      expect(ratio, preset.name).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    }
  });
});
