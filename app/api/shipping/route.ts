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

    // Correo Argentino / Regional Shipping Cost Logic in Argentina
    let baseCost = 3500;

    // CABA (C prefix or 1000-1499)
    if (firstChar === 'C' || (numericCP >= 1000 && numericCP <= 1499)) {
      baseCost = 3200;
    }
    // GBA (Gran Buenos Aires - 1600-1999 or B ranges near CABA)
    else if ((numericCP >= 1600 && numericCP <= 1999) || (firstChar === 'B' && numericCP < 7000)) {
      baseCost = 3900;
    }
    // Provincia de Buenos Aires (Interior)
    else if (firstChar === 'B' || (numericCP >= 2000 && numericCP <= 8700)) {
      baseCost = 4800;
    }
    // Resto del país (Interior / Rest of Argentina: Cordoba X, Santa Fe S, Mendoza M, etc.)
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
      service: 'Correo Argentino - Paq.ar (Clásico a Domicilio)',
    });
  } catch (error) {
    console.error('Error in shipping calculation API:', error);
    return NextResponse.json(
      { success: false, error: 'Error al calcular el costo de envío' },
      { status: 500 }
    );
  }
}
