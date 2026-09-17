import { NextResponse } from 'next/server';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postalCode, items } = body as { postalCode: string; items: CartItem[] };

    if (!postalCode || postalCode.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Código postal inválido' },
        { status: 400 }
      );
    }

    const cleanCP = postalCode.trim().toUpperCase();
    const hasLetterPrefix = /^[A-Z]/.test(cleanCP);
    const firstChar = cleanCP.charAt(0);
    const numericCP = parseInt(cleanCP.replace(/\D/g, ''), 10);

    // Estimate weight based on item count (default 0.5kg per item, min 1kg)
    const totalItemsCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 1;
    const estimatedWeightKg = Math.max(1, totalItemsCount * 0.5);

    // Origin: Mendoza Palmira (C.P. 5577)
    // Correo Argentino / Regional Shipping Cost Logic originating from Mendoza
    //
    // IMPORTANT: when the CP has a province letter (standard CPA format,
    // e.g. "X5000", "B2900"), that letter is authoritative and always wins.
    // The numeric-only ranges below are a fallback ONLY for legacy 4-digit
    // codes with no letter, since numeric ranges overlap across provinces
    // (e.g. X and M both cover parts of 5000-5999) and letter-less numeric
    // checks would silently misclassify CPs that do carry a letter.
    let baseCost: number;

    if (hasLetterPrefix) {
      if (firstChar === 'M' || firstChar === 'J' || firstChar === 'D') {
        baseCost = 2800; // Local / Cuyo: Mendoza (M), San Juan (J), San Luis (D)
      } else if (firstChar === 'X' || firstChar === 'S') {
        baseCost = 4200; // Región Centro: Córdoba (X), Santa Fe (S)
      } else if (firstChar === 'C' || firstChar === 'B') {
        baseCost = 4900; // CABA (C) & Buenos Aires (B)
      } else {
        baseCost = 6500; // Resto del país: Patagonia, NEA, NOA (letters other than the above)
      }
    } else {
      // Legacy 4-digit CP with no province letter - fall back to numeric ranges
      if (numericCP >= 5400 && numericCP <= 5799) {
        baseCost = 2800; // Local / Cuyo
      } else if (numericCP >= 2000 && numericCP <= 5999) {
        baseCost = 4200; // Región Centro
      } else if (numericCP >= 1000 && numericCP <= 1999) {
        baseCost = 4900; // CABA & Buenos Aires
      } else {
        baseCost = 6500; // Resto del país
      }
    }

    // Weight adjustment (each additional kg above 1kg adds $600)
    const weightExtra = Math.max(0, estimatedWeightKg - 1) * 600;
    const finalCost = Math.round(baseCost + weightExtra);

    return NextResponse.json({
      success: true,
      cost: finalCost,
      estimatedDays: '3 a 5 días hábiles',
      service: 'Correo Argentino - Paq.ar (Desde Mendoza Palmira)',
    });
  } catch (error) {
    console.error('Error in shipping calculation API:', error);
    return NextResponse.json(
      { success: false, error: 'Error al calcular el costo de envío' },
      { status: 500 }
    );
  }
}
