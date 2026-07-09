// src/lib/exchangeRates.ts
const FALLBACK_RATES: Record<string, number> = { 
  KES: 1, 
  USD: 0.0075, 
  EUR: 0.0069, 
  GBP: 0.0059 
};

export async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      console.warn('Missing EXCHANGE_RATE_API_KEY, using fallback rates.');
      return FALLBACK_RATES;
    }

    const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/KES`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Rate fetch failed with status: ${res.status}`);

    const data = (await res.json()) as { conversion_rates: Record<string, number> };
    return data.conversion_rates;
  } catch (error) {
    console.error('Exchange rate fetch failed, using fallback:', error);
    return FALLBACK_RATES;
  }
}