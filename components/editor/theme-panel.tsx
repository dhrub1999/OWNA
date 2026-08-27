"use client";

import { AlignCenter, AlignLeft, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRESET_SWATCHES, THEME_PRESETS } from "@/lib/themes/presets";
import { FONT_LIST } from "@/lib/themes/fonts";
import {
  contrastRatio,
  fixContrast,
  formatRatio,
  WCAG_AA_NORMAL,
} from "@/lib/themes/contrast";
import type { Theme } from "@/lib/themes/schema";
import {
  ColorField,
  Field,
  PanelSection,
  SegmentedField,
  SelectField,
  SliderField,
  SwitchField,
} from "./controls";
import { useEditor, useEditorDispatch } from "./editor-store";
import { ImageField } from "./image-field";

/**
 * The design panel.
 *
 * Progressive disclosure is the organising idea: colour, font and layout are
 * open by default, and spacing, shape and effects are one click away. Someone
 * who wants a good-looking page in two minutes never has to see a slider, and
 * someone who wants to sweat the corner radius can.
 */
export function ThemePanel() {
  const { document } = useEditor();
  const dispatch = useEditorDispatch();
  const { theme, layout } = document;

  const setTheme = (next: Theme) => dispatch({ type: "set-theme", theme: next });

  const patch = <K extends keyof Theme>(key: K, value: Partial<Theme[K]>) =>
    setTheme({ ...theme, [key]: { ...theme[key], ...value } } as Theme);

  const bodyContrast = contrastRatio(
    theme.colors.foreground,
    theme.colors.background,
  );
  const buttonContrast = contrastRatio(
    theme.colors.buttonForeground,
    theme.colors.button,
  );

  return (
    <>
      <PanelSection title="Presets">
        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((preset) => {
            const swatch = PRESET_SWATCHES[preset.id];
            return (
            <button
              key={preset.id}
              type="button"
              onClick={() => dispatch({ type: "apply-preset", preset: preset.id })}
              className="hover:border-foreground/30 focus-visible:ring-ring group cursor-pointer rounded-lg border p-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span
                className="mb-2 flex h-10 items-center justify-center rounded"
                style={{
                  backgroundColor: swatch.background,
                  color: swatch.foreground,
                  border: `1px solid ${swatch.border}`,
                }}
              >
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: swatch.accent }}
                />
              </span>
              <span className="text-xs font-medium">{preset.name}</span>
            </button>
            );
          })}
        </div>
        <p className="text-muted-foreground text-[11px]">
          A preset is a starting point. Everything stays editable afterwards.
        </p>
      </PanelSection>

      <PanelSection title="Colours">
        <ColorField
          label="Background"
          value={theme.colors.background}
          onChange={(value) => patch("colors", { background: value })}
        />
        <ColorField
          label="Text"
          value={theme.colors.foreground}
          onChange={(value) => patch("colors", { foreground: value })}
          warning={
            bodyContrast < WCAG_AA_NORMAL
              ? `Contrast is ${formatRatio(bodyContrast)}. Hard to read below 4.5:1.`
              : null
          }
        />
        {bodyContrast < WCAG_AA_NORMAL ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              patch("colors", {
                foreground: fixContrast(
                  theme.colors.foreground,
                  theme.colors.background,
                ),
              })
            }
          >
            <Wand2 aria-hidden="true" />
            Fix contrast
          </Button>
        ) : null}

        <ColorField
          label="Accent"
          value={theme.colors.accent}
          onChange={(value) => patch("colors", { accent: value })}
        />
        <ColorField
          label="Muted text"
          value={theme.colors.muted}
          onChange={(value) => patch("colors", { muted: value })}
        />
        <ColorField
          label="Cards"
          value={theme.colors.card}
          onChange={(value) => patch("colors", { card: value })}
        />
        <ColorField
          label="Borders"
          value={theme.colors.border}
          onChange={(value) => patch("colors", { border: value })}
        />
        <ColorField
          label="Buttons"
          value={theme.colors.button}
          onChange={(value) => patch("colors", { button: value })}
        />
        <ColorField
          label="Button text"
          value={theme.colors.buttonForeground}
          onChange={(value) => patch("colors", { buttonForeground: value })}
          warning={
            buttonContrast < WCAG_AA_NORMAL
              ? `Contrast is ${formatRatio(buttonContrast)}.`
              : null
          }
        />
      </PanelSection>

      <PanelSection title="Type">
        <FontSelect
          label="Headings"
          value={theme.typography.headingFont}
          onChange={(value) => patch("typography", { headingFont: value })}
        />
        <FontSelect
          label="Body"
          value={theme.typography.bodyFont}
          onChange={(value) => patch("typography", { bodyFont: value })}
        />
        <SliderField
          label="Scale"
          value={Math.round(theme.typography.scale * 100)}
          onChange={(value) => patch("typography", { scale: value / 100 })}
          min={80}
          max={160}
          step={5}
          unit="%"
        />
        <SelectField
          label="Heading weight"
          value={theme.typography.headingWeight}
          onChange={(value) => patch("typography", { headingWeight: value })}
          options={[
            { value: "400", label: "Regular" },
            { value: "500", label: "Medium" },
            { value: "600", label: "Semibold" },
            { value: "700", label: "Bold" },
            { value: "800", label: "Extrabold" },
            { value: "900", label: "Black" },
          ]}
        />
      </PanelSection>

      <PanelSection title="Layout">
        <SegmentedField
          label="Width"
          value={layout.width}
          onChange={(value) =>
            dispatch({ type: "set-layout", layout: { ...layout, width: value } })
          }
          options={[
            { value: "narrow", label: "Narrow" },
            { value: "default", label: "Default" },
            { value: "wide", label: "Wide" },
            { value: "full", label: "Full" },
          ]}
          columns={2}
        />
        <SegmentedField
          label="Alignment"
          value={layout.align}
          onChange={(value) =>
            dispatch({ type: "set-layout", layout: { ...layout, align: value } })
          }
          options={[
            { value: "left", label: "Left", icon: <AlignLeft className="size-3.5" /> },
            { value: "center", label: "Center", icon: <AlignCenter className="size-3.5" /> },
          ]}
        />
      </PanelSection>

      <PanelSection title="Background" defaultOpen={false}>
        <SegmentedField
          label="Type"
          value={theme.background.kind}
          onChange={(kind) => {
            // Each variant carries different fields, so switching resets to
            // that variant's defaults rather than merging incompatible ones.
            const next =
              kind === "gradient"
                ? { kind, from: theme.colors.accent, to: theme.colors.background, angle: 160 }
                : kind === "image"
                  ? { kind, url: "", overlay: 40, blur: 0 }
                  : kind === "pattern"
                    ? { kind, pattern: "dots" as const, opacity: 12 }
                    : { kind };
            setTheme({ ...theme, background: next as Theme["background"] });
          }}
          options={[
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Gradient" },
            { value: "pattern", label: "Pattern" },
            { value: "image", label: "Image" },
          ]}
          columns={2}
        />

        {theme.background.kind === "gradient" ? (
          <>
            <ColorField
              label="From"
              value={theme.background.from}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  background: { ...theme.background, from: value } as Theme["background"],
                })
              }
            />
            <ColorField
              label="To"
              value={theme.background.to}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  background: { ...theme.background, to: value } as Theme["background"],
                })
              }
            />
            <SliderField
              label="Angle"
              value={theme.background.angle}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  background: { ...theme.background, angle: value } as Theme["background"],
                })
              }
              min={0}
              max={360}
              unit="°"
            />
          </>
        ) : null}

        {theme.background.kind === "pattern" ? (
          <>
            <SelectField
              label="Pattern"
              value={theme.background.pattern}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  background: { ...theme.background, pattern: value } as Theme["background"],
                })
              }
              options={[
                { value: "dots", label: "Dots" },
                { value: "grid", label: "Grid" },
                { value: "diagonal", label: "Diagonal" },
                { value: "noise", label: "Noise" },
              ]}
            />
            <SliderField
              label="Strength"
              value={theme.background.opacity}
              onChange={(value) =>
                setTheme({
                  ...theme,
                  background: { ...theme.background, opacity: value } as Theme["background"],
                })
              }
              min={0}
              max={40}
              unit="%"
            />
          </>
        ) : null}

        {theme.background.kind === "image" ? (
          <BackgroundImageFields />
        ) : null}
      </PanelSection>

      <PanelSection title="Shape & space" defaultOpen={false}>
        <SliderField
          label="Corner radius"
          value={theme.radius.base}
          onChange={(value) =>
            patch("radius", {
              base: value,
              button: value,
              image: value,
              card: Math.round(value * 1.3),
            })
          }
          min={0}
          max={40}
        />
        <SelectField
          label="Photo shape"
          value={theme.radius.avatar}
          onChange={(value) => patch("radius", { avatar: value })}
          options={[
            { value: "circle", label: "Circle" },
            { value: "rounded", label: "Rounded" },
            { value: "square", label: "Square" },
          ]}
        />
        <SliderField
          label="Space between blocks"
          value={theme.spacing.block}
          onChange={(value) => patch("spacing", { block: value })}
          min={0}
          max={100}
        />
        <SliderField
          label="Page padding"
          value={theme.spacing.padding}
          onChange={(value) => patch("spacing", { padding: value })}
          min={0}
          max={72}
        />
        <SliderField
          label="Top & bottom"
          value={theme.spacing.section}
          onChange={(value) => patch("spacing", { section: value })}
          min={0}
          max={160}
        />
      </PanelSection>

      <PanelSection title="Effects" defaultOpen={false}>
        <SegmentedField
          label="Shadow"
          value={theme.effects.shadow}
          onChange={(value) => patch("effects", { shadow: value })}
          options={[
            { value: "none", label: "None" },
            { value: "soft", label: "Soft" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
          columns={2}
        />
        <SwitchField
          label="Card borders"
          checked={theme.effects.cardBorder}
          onChange={(value) => patch("effects", { cardBorder: value })}
        />
        <SwitchField
          label="Frosted glass"
          checked={theme.effects.glass}
          onChange={(value) => patch("effects", { glass: value })}
          hint="Translucent cards over the background"
        />
      </PanelSection>
    </>
  );
}

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: never) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as never)}
        aria-label={label}
        className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
      >
        {FONT_LIST.map((font) => (
          <option key={font.key} value={font.key}>
            {font.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Split out so the ImageField's upload state is not re-created on every theme tweak. */
function BackgroundImageFields() {
  const { document } = useEditor();
  const dispatch = useEditorDispatch();
  const { theme } = document;
  if (theme.background.kind !== "image") return null;

  const background = theme.background;
  const update = (patch: Partial<typeof background>) =>
    dispatch({
      type: "set-theme",
      theme: { ...theme, background: { ...background, ...patch } },
    });

  return (
    <>
      <ImageField
        label="Image"
        value={background.url}
        onChange={(url) => update({ url })}
      />
      <SliderField
        label="Overlay"
        value={background.overlay}
        onChange={(overlay) => update({ overlay })}
        min={0}
        max={100}
        unit="%"
      />
      <SliderField
        label="Blur"
        value={background.blur}
        onChange={(blur) => update({ blur })}
        min={0}
        max={24}
      />
    </>
  );
}

