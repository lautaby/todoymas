'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  ChevronRight,
  Fish,
  Cpu,
  Home,
  Flower2,
  Shirt,
  Sparkles,
  Tent,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase, type Category } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const NONE = 'none';
const NO_ICON = 'no-icon';

const ICON_OPTIONS: { value: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'Fish', label: 'Pesca', Icon: Fish },
  { value: 'Cpu', label: 'Tecnologia', Icon: Cpu },
  { value: 'Home', label: 'Hogar', Icon: Home },
  { value: 'Flower2', label: 'Belleza', Icon: Flower2 },
  { value: 'Shirt', label: 'Indumentaria', Icon: Shirt },
  { value: 'Sparkles', label: 'Bazar / Regalos', Icon: Sparkles },
  { value: 'Tent', label: 'Camping', Icon: Tent },
  { value: 'Camera', label: 'Fotografia', Icon: Camera },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = Object.fromEntries(
  ICON_OPTIONS.map((opt) => [opt.value, opt.Icon])
);

type FormState = {
  id: string | null;
  name: string;
  parent_id: string;
  icon: string;
};

const EMPTY_FORM: FormState = { id: null, name: '', parent_id: NONE, icon: NO_ICON };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CategoriasPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const parents = categories.filter((c) => !c.parent_id);
  const childrenOf = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  function openCreate(parentId?: string) {
    setForm({ id: null, name: '', parent_id: parentId ?? NONE, icon: NO_ICON });
    setDialogOpen(true);
  }

  function openEdit(c: Category) {
    setForm({ id: c.id, name: c.name, parent_id: c.parent_id ?? NONE, icon: c.icon ?? NO_ICON });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast({ title: 'Falta el nombre', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      parent_id: form.parent_id === NONE ? null : form.parent_id,
      icon: form.parent_id === NONE && form.icon !== NO_ICON ? form.icon : null,
    };

    const { error } = form.id
      ? await supabase.from('categories').update(payload).eq('id', form.id)
      : await supabase.from('categories').insert(payload);

    setSaving(false);

    if (error) {
      toast({ title: 'No se pudo guardar la categoria', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: form.id ? 'Categoria actualizada' : 'Categoria creada' });
    setDialogOpen(false);
    loadData();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('categories').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);

    if (error) {
      toast({ title: 'No se pudo eliminar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Categoria eliminada' });
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Organiza el catalogo en categorias y subcategorias</p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva categoria
        </Button>
      </div>

      {loading && <p className="text-muted-foreground">Cargando...</p>}

      {!loading && parents.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground bg-card">
          Todavia no hay categorias. Crea la primera.
        </div>
      )}

      <div className="space-y-3">
        {parents.map((parent) => (
          <div key={parent.id} className="border rounded-lg bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 min-w-0">
                {parent.icon && ICON_MAP[parent.icon] ? (
                  (() => {
                    const Icon = ICON_MAP[parent.icon as string];
                    return (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                    );
                  })()
                ) : (
                  <FolderTree className="h-4 w-4 text-primary shrink-0" />
                )}
                <span className="font-medium truncate">{parent.name}</span>
                <Badge variant="secondary">{childrenOf(parent.id).length} subcategorias</Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openCreate(parent.id)} title="Agregar subcategoria">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(parent)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(parent)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {childrenOf(parent.id).length > 0 && (
              <div className="border-t divide-y">
                {childrenOf(parent.id).map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-3 pl-8 bg-muted/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{child.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(child)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(child)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar categoria' : 'Nueva categoria'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Pesca"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Categoria padre (opcional)</Label>
              <Select
                value={form.parent_id}
                onValueChange={(v) => setForm({ ...form, parent_id: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Ninguna (categoria principal)</SelectItem>
                  {parents
                    .filter((p) => p.id !== form.id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Dejala vacia para crear una categoria principal, o elegi una para crear una subcategoria.
              </p>
            </div>

            {form.parent_id === NONE && (
              <div className="space-y-1.5">
                <Label>Icono (opcional)</Label>
                <Select
                  value={form.icon}
                  onValueChange={(v) => setForm({ ...form, icon: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_ICON}>Sin icono</SelectItem>
                    {ICON_OPTIONS.map(({ value, label, Icon }) => (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Se muestra en la portada y el menu de categorias. Las subcategorias no llevan icono propio.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoria</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que queres eliminar &quot;{deleteTarget?.name}&quot;? Si tiene subcategorias o productos asociados,
              tambien se van a ver afectados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
