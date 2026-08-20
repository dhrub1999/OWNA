import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  fixContrast,
  hexToRgb,
  meetsAA,
  readableOn,
} from "@/lib/themes/contrast";

describe("contrast", () => {
  it("matches the known WCAG extremes", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("parses all three hex lengths", () => {
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#ff000080")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("nonsense")).toBeNull();
  });

  it("picks the readable end of the scale", () => {
    expect(readableOn("#000000")).toBe("#ffffff");
    expect(readableOn("#ffffff")).toBe("#000000");
  });

  it("moves a failing colour until it passes", () => {
    const fixed = fixContrast("#999999", "#ffffff");
    expect(meetsAA(fixed, "#ffffff")).toBe(true);
  });

  it("leaves a passing colour alone", () => {
    expect(fixContrast("#111111", "#ffffff")).toBe("#111111");
  });

  it("lightens rather than darkens on a dark background", () => {
    const fixed = fixContrast("#333333", "#000000");
    expect(meetsAA(fixed, "#000000")).toBe(true);
  });
});
