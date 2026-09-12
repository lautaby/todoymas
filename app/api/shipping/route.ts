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
    const firstChar = cleanCP.charAt(0);
    const numericCP = parseInt(cleanCP.replace(/\D/g, ''), 10);

    // Estimate weight based on item count (default 0.5kg per item, min 1kg)
    const totalItemsCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 1;
    const estimatedWeightKg = Math.max(1, totalItemsCount * 0.5);

    // Origin: Mendoza Palmira (C.P. 5577)
    // Correo Argentino / Regional Shipping Cost Logic originating from Mendoza
    let baseCost = 4500;

    // 1. Local / Cuyo region (Mendoza M 5500-5699, San Juan J 5400-5499, San Luis D 5700-5799)
    if (
      firstChar === 'M' || 
      firstChar === 'J' || 
      firstChar === 'D' || 
      (numericCP >= 5400 && numericCP <= 5799)
    ) {
      baseCost = 2800; // Local / Cuyo
    }
    // 2. Region Centro (Córdoba X 5000-5999, Santa Fe S 2000-S3500)
    else if (
      firstChar === 'X' || 
      firstChar === 'S' || 
      (numericCP >= 2000 && numericCP <= 5999)
    ) {
      baseCost = 4200;
    }
    // 3. CABA & Buenos Aires (C prefix or 1000-1999, B prefix)
    else if (
      firstChar === 'C' || 
      firstChar === 'B' || 
      (numericCP >= 1000 && numericCP <= 1999)
    ) {
      baseCost = 4900;
    }
    // 4. Resto del país (Patagonia, NEA, NOA)
    else {
      baseCost = 6500;
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
