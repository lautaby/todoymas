'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, FolderTree, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, type Product, type Order } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendiente: 'outline',
  confirmado: 'secondary',
  enviado: 'default',
  entregado: 'default',
  cancelado: 'destructive',
};

export default function DashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ count: pCount }, { count: cCount }, { count: oCount }, { data: low }, { data: recent }, { data: allOrders }] =
        await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*').lte('stock', 5).order('stock', { ascending: true }).limit(5),
          supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('orders').select('total, status'),
        ]);

      setProductCount(pCount ?? 0);
      setCategoryCount(cCount ?? 0);
      setOrderCount(oCount ?? 0);
      setLowStock((low as Product[]) ?? []);
      setRecentOrders((recent as Order[]) ?? []);

      const total = (allOrders ?? [])
        .filter((o) => o.status !== 'cancelado')
        .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
      setSalesTotal(total);

      setLoading(false);
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Productos', value: productCount, icon: Package, href: '/admin/productos' },
    { label: 'Categorías', value: categoryCount, icon: FolderTree, href: '/admin/categorias' },
    { label: 'Pedidos', value: orderCount, icon: ShoppingCart, href: '/admin/pedidos' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de la tienda</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{loading ? '-' : s.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ventas totales</p>
              <p className="text-2xl font-bold">{loading ? '-' : formatPrice(salesTotal)}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!loading && lowStock.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay productos con stock bajo.</p>
            )}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">{p.name}</span>
                <Badge variant={p.stock === 0 ? 'destructive' : 'outline'}>
                  {p.stock} en stock
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!loading && recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">Todavía no hay pedidos.</p>
            )}
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 pr-2">
                  <p className="truncate font-medium">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-medium">{formatPrice(o.total)}</span>
                  <Badge variant={STATUS_VARIANT[o.status] ?? 'outline'}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
