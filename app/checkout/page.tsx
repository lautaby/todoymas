'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Truck, Store, CreditCard, Lock } from 'lucide-react';
import { StoreLayout } from '@/components/store-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_method: 'retiro',
    address: '',
    city: '',
    notes: '',
  });

  const shippingCost = form.shipping_method === 'envio' ? 3500 : 0;
  const grandTotal = total + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setProcessing(true);
    setError(null);

    try {
      const orderItems = items.map(i => ({
        product_id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.images[0] ?? '',
      }));

      const { data, error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.customer_name,
          customer_email: form.customer_email || null,
          customer_phone: form.customer_phone || null,
          status: 'pendiente',
          shipping_method: form.shipping_method,
          address: form.shipping_method === 'envio' ? form.address : null,
          city: form.shipping_method === 'envio' ? form.city : null,
          notes: form.notes || null,
          total: grandTotal,
          items: orderItems,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      setOrderId(data.id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      setError('Ocurrio un error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-success/10 mb-6">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">¡Pedido realizado!</h1>
            <p className="text-muted-foreground mb-1">
              Tu pedido se registro correctamente.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Numero de pedido: <span className="font-mono font-medium text-foreground">{orderId?.slice(0, 8)}</span>
            </p>
            <div className="rounded-xl border bg-card p-4 text-left mb-6">
              <p className="text-sm text-muted-foreground">Nos contactaremos a la brevedad para coordinar {form.shipping_method === 'retiro' ? 'el retiro en nuestro local' : 'la entrega'}.</p>
            </div>
            <Link href="/catalogo">
              <Button size="lg" className="w-full">
                Seguir comprando
              </Button>
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg font-medium mb-2">No hay productos en el carrito</p>
          <Link href="/catalogo">
            <Button className="mt-4">Ir al catalogo</Button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/carrito" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </Link>

        <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact info */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Datos de contacto</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre y apellido *</Label>
                  <Input
                    id="name"
                    required
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="Juan Perez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono *</Label>
                  <Input
                    id="phone"
                    required
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="11-5555-1234"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  placeholder="juan@email.com"
                />
              </div>
            </div>

            {/* Shipping method */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Metodo de envio</h2>
              <RadioGroup
                value={form.shipping_method}
                onValueChange={(v) => setForm({ ...form, shipping_method: v })}
              >
                <div className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                  form.shipping_method === 'retiro' && 'border-primary bg-accent/50'
                )}>
                  <RadioGroupItem value="retiro" id="retiro" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      <Label htmlFor="retiro" className="font-medium cursor-pointer">Retiro en local</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Sin costo adicional - Disponible de Lun a Sab</p>
                  </div>
                  <span className="font-semibold text-success">Gratis</span>
                </div>

                <div className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                  form.shipping_method === 'envio' && 'border-primary bg-accent/50'
                )}>
                  <RadioGroupItem value="envio" id="envio" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <Label htmlFor="envio" className="font-medium cursor-pointer">Envio a domicilio</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Entrega en 3-5 dias habiles</p>
                  </div>
                  <span className="font-semibold">{formatPrice(3500)}</span>
                </div>
              </RadioGroup>

              {form.shipping_method === 'envio' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Direccion de envio *</Label>
                    <Input
                      id="address"
                      required={form.shipping_method === 'envio'}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Av. Corrientes 1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      required={form.shipping_method === 'envio'}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="CABA"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Notas del pedido (opcional)</h2>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Indicaciones especiales para la entrega..."
                rows={3}
              />
            </div>

            {/* Payment (mocked) */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Metodo de pago</h2>
              </div>
              <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Pago simulado (prototipo)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  La integracion de pago estara disponible proximamente. El pedido se registrara sin cobro real.
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 rounded-xl border bg-card p-6 space-y-4">
              <h2 className="font-bold text-lg">Tu pedido</h2>
              <Separator />
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {item.product.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity}x {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envio</span>
                  <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl text-primary">{formatPrice(grandTotal)}</span>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={processing}>
                {processing ? 'Procesando...' : 'Confirmar pedido'}
              </Button>
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Compra segura y protegida
              </p>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
