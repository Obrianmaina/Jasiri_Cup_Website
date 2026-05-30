// src/app/api/rates/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      throw new Error('Exchange rate API key not configured');
    }

    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/KES`, {
      next: { revalidate: 3600 } // Cache for 1 hour to prevent API limit exhaustion
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rates');
    }

    const data = await response.json();
    return NextResponse.json({ rates: data.conversion_rates });
  } catch (error) {
    console.error('Error fetching rates:', error);
    // Provide sensible fallbacks if the API request fails
    return NextResponse.json({
      rates: { KES: 1, USD: 0.0075, EUR: 0.0069, GBP: 0.0059 }
    }, { status: 200 });
  }
}