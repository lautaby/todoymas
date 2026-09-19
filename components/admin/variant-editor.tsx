'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, Palette, Camera, ImageIcon, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-compress';

const BUCKET = 'product-images';
const MAX_SIZE_MB = 5;

export type VariantFormRow = {
  id: string;
  group_name: string;
  label: string;
  color_hex: string;
  image_url: string;
  stock: string;
};

let counter = 0;
function newRowId() {
  counter += 1;
  return `new-${Date.now()}-${counter}`;
}

export function emptyVariantRow(groupName = ''): VariantFormRow {
  return { id: newRowId(), group_name: groupName, label: '', color_hex: '', image_url: '', stock: '' };
}

function VariantPhotoPicker({
  url,
  onChange,
}: {
  url: string;
  onChange: (url: string) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Eso no es una imagen', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const compressed = await compressImage(file);
    if (compressed.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ title: `La imagen pesa más de ${MAX_SIZE_MB}MB incluso comprimida`, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const ext = compressed.name.split('.').pop() || 'jpg';
    const path = `variant-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
      cacheControl: '3600',
      upsert: false,
      contentType: compressed.type || undefined,
    });
    setUploading(false);
    if (error) {
      toast({ title: 'No se pudo subir la foto', description: error.message, variant: 'destructive' });
      return;
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div className="relative shrink-0" title="Foto de esta variante (opcional)">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border bg-background"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Foto variante" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {url && !uploading && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
          aria-label="Quitar foto"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
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
          color, aroma o talle disponible (ej: &quot;Color&quot; / &quot;Rojo cereza&quot;), y si
          querés, una foto propia para esa opción.
        </p>
      )}

      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((row) => (
            <div key={row.id} className="flex flex-wrap gap-2 items-center rounded-lg border p-2">
              <VariantPhotoPicker
                url={row.image_url}
                onChange={(image_url) => updateRow(row.id, { image_url })}
              />
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
