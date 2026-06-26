import { describe, expect, it } from "vitest";
import { calculateTax, convertCurrency, formatMoney, type ExchangeRate } from "./currency";

const rates: ExchangeRate[] = [
  { base_currency: "USD", quote_currency: "EUR", rate: 0.9, as_of_date: "2026-06-22" },
  { base_currency: "USD", quote_currency: "GBP", rate: 0.8, as_of_date: "2026-06-22" },
  { base_currency: "USD", quote_currency: "KES", rate: 130, as_of_date: "2026-06-22" },
];

describe("convertCurrency", () => {
  it("returns same amount for same currency", () => {
    expect(convertCurrency(100, "USD", "USD", rates)).toBe(100);
  });
  it("converts using direct rate", () => {
    expect(convertCurrency(100, "USD", "EUR", rates)).toBeCloseTo(90);
  });
  it("converts using inverse rate", () => {
    expect(convertCurrency(90, "EUR", "USD", rates)).toBeCloseTo(100);
  });
  it("pivots through USD", () => {
    // EUR → GBP via USD: 90 EUR / 0.9 = 100 USD * 0.8 = 80 GBP
    expect(convertCurrency(90, "EUR", "GBP", rates)).toBeCloseTo(80);
  });
  it("throws when no path exists", () => {
    expect(() => convertCurrency(1, "XYZ", "EUR", rates)).toThrow();
  });
  it("rejects non-finite amount", () => {
    expect(() => convertCurrency(Number.NaN, "USD", "EUR", rates)).toThrow();
  });
});

describe("calculateTax", () => {
  it("adds tax on top (exclusive)", () => {
    expect(calculateTax({ amount: 100, rate: 0.2 })).toEqual({ net: 100, tax: 20, gross: 120 });
  });
  it("extracts inclusive tax", () => {
    const r = calculateTax({ amount: 120, rate: 0.2, inclusive: true });
    expect(r.net).toBeCloseTo(100);
    expect(r.tax).toBeCloseTo(20);
    expect(r.gross).toBe(120);
  });
  it("handles zero rate", () => {
    expect(calculateTax({ amount: 50, rate: 0 })).toEqual({ net: 50, tax: 0, gross: 50 });
  });
  it("rejects negative rate", () => {
    expect(() => calculateTax({ amount: 1, rate: -0.1 })).toThrow();
  });
});

describe("formatMoney", () => {
  it("formats with currency symbol", () => {
    const out = formatMoney(1234.5, { code: "USD", symbol: "$", decimals: 2 }, "en-US");
    expect(out).toMatch(/\$/);
    expect(out).toMatch(/1,234\.50/);
  });
  it("respects zero-decimal currencies", () => {
    const out = formatMoney(1234.7, { code: "JPY", symbol: "¥", decimals: 0 }, "en-US");
    expect(out).not.toMatch(/\./);
  });
});
