'use client';

import { Plus, Trash2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type VariantFormRow = {
  id: string;
  group_name: string;
  label: string;
  color_hex: string;
  stock: string;
};

let counter = 0;
function newRowId() {
  counter += 1;
  return `new-${Date.now()}-${counter}`;
}

export function emptyVariantRow(groupName = ''): VariantFormRow {
  return { id: newRowId(), group_name: groupName, label: '', color_hex: '', stock: '' };
}

export function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantFormRow[];
  onChange: (variants: VariantFormRow[]) => void;
}) {
  function updateRow(id: string, patch: Partial<VariantFormRow>) {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function removeRow(id: string) {
    onChange(variants.filter((v) => v.id !== id));
  }

  function addRow() {
    // Sugiere el mismo nombre de grupo que la última fila, para que sea
    // rápido agregar varios colores/aromas seguidos.
    const lastGroup = variants[variants.length - 1]?.group_name ?? '';
    onChange([...variants, emptyVariantRow(lastGroup)]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Variantes (colores, aromas, talles...)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Agregar variante
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Sin variantes, el producto se vende como una sola opción. Agregá una fila por cada
          color, aroma o talle disponible (ej: &quot;Color&quot; / &quot;Rojo cereza&quot;).
        </p>
      )}

      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((row) => (
            <div key={row.id} className="flex flex-wrap gap-2 items-center rounded-lg border p-2">
              <Input
                placeholder="Grupo (ej: Color)"
                value={row.group_name}
                onChange={(e) => updateRow(row.id, { group_name: e.target.value })}
                className="text-sm flex-1 min-w-[110px]"
              />
              <Input
                placeholder="Valor (ej: Rojo cereza)"
                value={row.label}
                onChange={(e) => updateRow(row.id, { label: e.target.value })}
                className="text-sm flex-1 min-w-[140px]"
              />
              <Input
                type="number"
                placeholder="Stock"
                value={row.stock}
                onChange={(e) => updateRow(row.id, { stock: e.target.value })}
                className="text-sm w-20"
              />
              <div className="flex items-center gap-1" title="Color (opcional, para maquillaje/pinturas)">
                <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="color"
                  value={row.color_hex || '#8B8F86'}
                  onChange={(e) => updateRow(row.id, { color_hex: e.target.value })}
                  className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-background"
                />
                {row.color_hex && (
                  <button
                    type="button"
                    onClick={() => updateRow(row.id, { color_hex: '' })}
                    className="text-[10px] text-muted-foreground hover:text-destructive underline"
                  >
                    quitar
                  </button>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removeRow(row.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
