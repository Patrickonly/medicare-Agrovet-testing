// Currency & tax engine — pure helpers, easy to unit-test.

export interface CurrencyMeta {
  code: string;
  symbol: string;
  decimals: number;
}

export interface ExchangeRate {
  base_currency: string;
  quote_currency: string;
  rate: number; // 1 base = rate * quote
  as_of_date: string;
}

/**
 * Convert an amount from one currency to another using a list of rates.
 * Supports direct, inverse, and one-hop (via USD) conversions.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRate[],
  pivot: string = "USD",
): number {
  if (!Number.isFinite(amount)) throw new Error("Amount must be a finite number");
  if (from === to) return amount;

  const direct = rates.find((r) => r.base_currency === from && r.quote_currency === to);
  if (direct) return amount * direct.rate;

  const inverse = rates.find((r) => r.base_currency === to && r.quote_currency === from);
  if (inverse) return amount / inverse.rate;

  // Pivot via USD (or supplied pivot)
  const fromToPivot = rates.find((r) => r.base_currency === from && r.quote_currency === pivot)
    ?? (() => {
      const inv = rates.find((r) => r.base_currency === pivot && r.quote_currency === from);
      return inv ? { ...inv, base_currency: from, quote_currency: pivot, rate: 1 / inv.rate } : undefined;
    })();
  const pivotToTo = rates.find((r) => r.base_currency === pivot && r.quote_currency === to)
    ?? (() => {
      const inv = rates.find((r) => r.base_currency === to && r.quote_currency === pivot);
      return inv ? { ...inv, base_currency: pivot, quote_currency: to, rate: 1 / inv.rate } : undefined;
    })();

  if (fromToPivot && pivotToTo) return amount * fromToPivot.rate * pivotToTo.rate;

  throw new Error(`No conversion path from ${from} to ${to}`);
}

export function formatMoney(
  amount: number,
  currency: CurrencyMeta,
  locale: string = "en",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(currency.decimals)}`;
  }
}

export interface TaxCalcInput {
  amount: number;
  rate: number; // 0..1
  inclusive?: boolean;
}

export interface TaxCalcResult {
  net: number;
  tax: number;
  gross: number;
}

/**
 * Compute net / tax / gross for an amount.
 * - inclusive=true → `amount` already includes tax; reverse-compute.
 * - inclusive=false (default) → `amount` is net; tax is added on top.
 */
export function calculateTax({ amount, rate, inclusive = false }: TaxCalcInput): TaxCalcResult {
  if (rate < 0) throw new Error("Tax rate cannot be negative");
  if (!Number.isFinite(amount)) throw new Error("Amount must be finite");
  if (inclusive) {
    const net = amount / (1 + rate);
    return { net: round2(net), tax: round2(amount - net), gross: round2(amount) };
  }
  const tax = amount * rate;
  return { net: round2(amount), tax: round2(tax), gross: round2(amount + tax) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
