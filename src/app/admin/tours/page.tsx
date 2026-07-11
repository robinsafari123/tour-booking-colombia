'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Map,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Upload,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCOP, tours as seedTours } from '@/components/ToursSection';
import { adminFetch } from '@/lib/admin-fetch';

interface Tour {
  id?: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  detail_es?: string;
  detail_en?: string;
  price_cop: number;
  duration_es: string;
  duration_en: string;
  destination: string;
  image_url: string;
  max_people: number;
  group_size?: string;
  badge_es: string;
  badge_en: string;
  badge_color: string;
  is_active: boolean;
  sort_order?: number;
  rating?: number;
}

const emptyTour: Tour = {
  name_es: '',
  name_en: '',
  description_es: '',
  description_en: '',
  detail_es: '',
  detail_en: '',
  price_cop: 0,
  duration_es: '',
  duration_en: '',
  destination: '',
  image_url: '',
  max_people: 10,
  group_size: '',
  badge_es: '',
  badge_en: '',
  badge_color: 'bg-emerald-500',
  is_active: true,
  sort_order: 0,
};

async function compressImage(file: File, maxWidth = 1400, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Compression failed')), 'image/jpeg', quality);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function ImageUploadButton({ onUrl }: { onUrl: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const compressed = await compressImage(file).catch(() => file);
    const fd = new FormData();
    fd.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'));
    const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok && data.url) {
      onUrl(data.url);
    } else {
      setError(data.error || 'Error al subir');
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={handleFile} />
      <button
        type='button'
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className='flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-60'
      >
        {uploading ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Upload className='w-3.5 h-3.5' />}
        {uploading ? 'Subiendo...' : 'Subir imagen'}
      </button>
      {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
    </div>
  );
}

function RichTextArea({ value, onChange, rows = 3, placeholder }: {
  value: string;
  onChange: (html: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync value into DOM only when it differs (avoids resetting cursor on every keystroke)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  function handleInput() {
    onChange(ref.current?.innerHTML ?? '');
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (html) {
      // Strip all tags except bold/italic/br/p
      const div = document.createElement('div');
      div.innerHTML = html;
      const clean = div.innerHTML.replace(/<(?!\/?(?:strong|b|em|i|br|p)(?:\s[^>]*)?\/?>) [^>]+>/gi, '');
      document.execCommand('insertHTML', false, clean);
    } else {
      document.execCommand('insertText', false, text);
    }
    handleInput();
  }

  function execBold() {
    ref.current?.focus();
    document.execCommand('bold');
    handleInput();
  }

  return (
    <div className='rounded-md border border-gray-700 bg-gray-800 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600'>
      <div className='flex items-center gap-1 px-2 py-1 border-b border-gray-700 bg-gray-900/50'>
        <button
          type='button'
          onMouseDown={(e) => { e.preventDefault(); execBold(); }}
          className='w-6 h-6 rounded text-white font-bold text-sm hover:bg-gray-700 transition-colors flex items-center justify-center'
          title='Negrita (Ctrl+B)'
        >B</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        style={{ minHeight: `${rows * 1.6}rem` }}
        className='px-3 py-2 text-sm text-white outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500'
        data-placeholder={placeholder}
      />
    </div>
  );
}

function TourFormModal({
  tour,
  onSave,
  onClose,
}: {
  tour: Tour | null;
  onSave: (tour: Tour) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Tour>(tour || emptyTour);
  const [durationDays, setDurationDays] = useState(() => {
    const n = parseInt((tour || emptyTour).duration_es);
    return isNaN(n) ? '' : String(n);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof Tour, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const days = durationDays || '1';
    const nums = form.group_size?.match(/\d+/g);
    const derivedMax = nums ? parseInt(nums[nums.length - 1]) : form.max_people;
    const toSave: Tour = { ...form, duration_es: `${days} Días`, duration_en: `${days} Days`, max_people: derivedMax };
    // Only include detail fields if they have content (guards against missing DB columns)
    if (!toSave.detail_es) delete toSave.detail_es;
    if (!toSave.detail_en) delete toSave.detail_en;
    try {
      await onSave(toSave);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">
            {tour?.id ? 'Editar Tour' : 'Agregar Tour'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Nombre (Español)</Label>
              <Input
                value={form.name_es}
                onChange={(e) => set('name_es', e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Expedición Cerros de Mavicure"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Nombre (Inglés)</Label>
              <Input
                value={form.name_en}
                onChange={(e) => set('name_en', e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Mavicure Hills Expedition"
              />
            </div>
          </div>

          {/* Short descriptions (card) */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Descripción corta — aparece en la tarjeta</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Español</Label>
                <RichTextArea
                  value={form.description_es}
                  onChange={(html) => set('description_es', html)}
                  rows={2}
                  placeholder="Descripción breve del tour..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">English</Label>
                <RichTextArea
                  value={form.description_en}
                  onChange={(html) => set('description_en', html)}
                  rows={2}
                  placeholder="Short tour description..."
                />
              </div>
            </div>
          </div>

          {/* Long descriptions (tour page) */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Descripción larga — aparece en la página del tour</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">Español</Label>
                <RichTextArea
                  value={form.detail_es || ''}
                  onChange={(html) => set('detail_es', html)}
                  rows={4}
                  placeholder="Descripción detallada, qué incluye, itinerario..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-300 text-sm">English</Label>
                <RichTextArea
                  value={form.detail_en || ''}
                  onChange={(html) => set('detail_en', html)}
                  rows={4}
                  placeholder="Detailed description, what's included, itinerary..."
                />
              </div>
            </div>
          </div>

          {/* Price, Duration, Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Precio COP</Label>
              <Input
                type="number"
                value={form.price_cop}
                onChange={(e) => set('price_cop', Number(e.target.value))}
                required
                min={0}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="3900000"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-gray-300 text-sm">Duración (número de días)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  required
                  min={1}
                  className="bg-gray-800 border-gray-700 text-white w-24"
                  placeholder="5"
                />
                <span className="text-gray-400 text-sm">días / days</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Destino</Label>
              <Input
                value={form.destination}
                onChange={(e) => set('destination', e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Guainía, Colombia"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Personas</Label>
              <Input
                value={form.group_size || ''}
                onChange={(e) => set('group_size', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="8+ personas"
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">Imagen del tour</Label>
            {form.image_url && (
              <div className="relative rounded-xl overflow-hidden h-36 bg-gray-800 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('image_url', '')}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ImageUploadButton onUrl={(url) => set('image_url', url)} />
              <span className="text-gray-500 text-xs">o</span>
              <Input
                value={form.image_url}
                onChange={(e) => set('image_url', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-xs"
                placeholder="https://... (URL)"
              />
            </div>
          </div>

          {/* Sort order */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">Orden de aparición</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => set('sort_order', Number(e.target.value))}
                min={0}
                className="bg-gray-800 border-gray-700 text-white w-24"
                placeholder="0"
              />
              <span className="text-gray-500 text-xs">0 = primero, números más altos aparecen después</span>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              {form.is_active ? (
                <ToggleRight className="w-6 h-6 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>
            <span className="text-gray-300 text-sm">
              {form.is_active ? 'Tour activo (visible en el sitio)' : 'Tour inactivo (oculto)'}
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700 text-gray-300">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Tour'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  tour,
  onConfirm,
  onClose,
}: {
  tour: Tour;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Eliminar Tour</h3>
            <p className="text-gray-400 text-sm">
              ¿Estás seguro de eliminar{' '}
              <span className="text-white font-medium">{tour.name_es}</span>? Esta
              acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 border-gray-700 text-gray-300">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ToursAdminPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [deletingTour, setDeletingTour] = useState<Tour | null>(null);

  async function fetchTours() {
    setLoading(true);
    setError('');
    const res = await adminFetch('/api/admin/tours');
    if (res.ok) {
      setTours(await res.json());
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: 'Error al cargar tours' }));
      setError(msg);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTours();
  }, []);

  async function handleSave(tour: Tour) {
    if (tour.id) {
      const { id, ...rest } = tour;
      const res = await adminFetch(`/api/admin/tours/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: 'Error al guardar' }));
        throw new Error(msg);
      }
    } else {
      const res = await adminFetch('/api/admin/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tour),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: 'Error al guardar' }));
        throw new Error(msg);
      }
    }
    await fetchTours();
  }

  async function handleToggleActive(tour: Tour) {
    const res = await adminFetch(`/api/admin/tours/${tour.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !tour.is_active }),
    });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Error' }));
      setError(msg);
    } else {
      setTours((prev) =>
        prev.map((t) => (t.id === tour.id ? { ...t, is_active: !t.is_active } : t))
      );
    }
  }

  async function handleDelete() {
    if (!deletingTour?.id) return;
    const res = await adminFetch(`/api/admin/tours/${deletingTour.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Error al eliminar' }));
      setError(msg);
    } else {
      setTours((prev) => prev.filter((t) => t.id !== deletingTour.id));
    }
    setDeletingTour(null);
  }

  async function handleSeedTours() {
    const toInsert = seedTours.map((t) => ({
      name_es: t.name.es,
      name_en: t.name.en,
      description_es: t.description.es,
      description_en: t.description.en,
      price_cop: t.priceCOP,
      duration_es: t.duration.es,
      duration_en: t.duration.en,
      destination: t.location,
      image_url: t.image,
      max_people: parseInt(t.groupSize.split('–')[1] || '10'),
      badge_es: t.badge.es,
      badge_en: t.badge.en,
      badge_color: t.badgeColor,
      is_active: true,
    }));
    const res = await adminFetch('/api/admin/tours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toInsert),
    });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: 'Error al cargar tours' }));
      setError(msg);
    } else {
      await fetchTours();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map className="w-5 h-5 text-emerald-500" />
            <h1 className="text-white text-2xl font-bold">Tours</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Gestiona el catálogo de tours disponibles
          </p>
        </div>
        <div className="flex gap-2">
          {tours.length === 0 && !loading && (
            <Button
              onClick={handleSeedTours}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 text-sm"
            >
              Cargar tours de ejemplo
            </Button>
          )}
          <Button
            onClick={() => {
              setEditingTour(null);
              setModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Tour
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tours.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay tours creados</p>
          <p className="text-sm mt-1">
            Haz clic en &quot;Agregar Tour&quot; o carga los de ejemplo
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {tours.map((tour) => (
            <Card key={tour.id} className="bg-gray-900 border-gray-800 overflow-hidden">
              {/* Image */}
              {tour.image_url && (
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={tour.image_url}
                    alt={tour.name_es}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  {tour.badge_es && (
                    <span
                      className={`absolute top-3 left-3 ${tour.badge_color} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}
                    >
                      {tour.badge_es}
                    </span>
                  )}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(tour)}
                      className="transition-colors"
                      title={tour.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {tour.is_active ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400 drop-shadow" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-500 drop-shadow" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                {/* Name + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {tour.name_es}
                    </h3>
                    <p className="text-gray-400 text-xs truncate">{tour.destination}</p>
                  </div>
                  <Badge
                    className={`text-xs border flex-shrink-0 ${
                      tour.is_active
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-700/50 text-gray-400 border-gray-600'
                    }`}
                  >
                    {tour.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                {/* Price + Duration */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-bold">
                    {formatCOP(tour.price_cop)}
                  </span>
                  <span className="text-gray-500">{tour.duration_es}</span>
                </div>

                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {tour.description_es}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => {
                      setEditingTour(tour);
                      setModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => setDeletingTour(tour)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <TourFormModal
          tour={editingTour}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditingTour(null);
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingTour && (
        <DeleteConfirmModal
          tour={deletingTour}
          onConfirm={handleDelete}
          onClose={() => setDeletingTour(null)}
        />
      )}
    </div>
  );
}
