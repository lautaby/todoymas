'use client';

import { useEffect, useState } from 'react';
import { Eye, Truck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase, type Order } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

const STATUSES = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'] as const;

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

export default function PedidosPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('todos');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = filter === 'todos' ? orders : orders.filter((o) => o.status === filter);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    setUpdating(false);

    if (error) {
      toast({ title: 'No se pudo actualizar el estado', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Estado actualizado' });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setSelected((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">{orders.length} pedidos en total</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {STATUS_LABEL[s]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border rounded-lg overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Envío</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay pedidos en este estado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(o.created_at)}</TableCell>
                <TableCell className="text-sm">
                  <span className="inline-flex items-center gap-1">
                    {o.shipping_method === 'envio' ? (
                      <Truck className="h-3.5 w-3.5" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                    {o.shipping_method === 'envio' ? 'Envío' : 'Retiro'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{formatPrice(o.total)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.status] ?? 'outline'}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelected(o)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Pedido de {selected.customer_name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p>{selected.customer_phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="truncate">{selected.customer_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Método de envío</p>
                    <p>{selected.shipping_method === 'envio' ? 'Envío a domicilio' : 'Retiro en local'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha</p>
                    <p>{formatDate(selected.created_at)}</p>
                  </div>
                  {selected.address && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Dirección</p>
                      <p>
                        {selected.address}
                        {selected.city ? `, ${selected.city}` : ''}
                      </p>
                    </div>
                  )}
                  {selected.notes && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Notas</p>
                      <p>{selected.notes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Productos</p>
                  <div className="space-y-2">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t font-bold">
                    <span>Total</span>
                    <span>{formatPrice(selected.total)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Estado del pedido</p>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => updateStatus(selected.id, v)}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
