'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCOP } from '@/components/ToursSection';
import supabase from '@/lib/supabase';

interface Booking {
  id: string;
  tour_id: string | null;
  tour_name: string;
  customer_name: string;
  email: string;
  phone: string;
  date: string;
  num_people: number;
  notes: string | null;
  payment_status: 'pending' | 'confirmed' | 'cancelled';
  total_cop: number;
  created_at: string;
  wompi_transaction_id: string | null;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  confirmed: {
    label: 'Confirmado',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};

function BookingDetailRow({ booking, onStatusChange }: { booking: Booking; onStatusChange: (id: string, status: 'confirmed' | 'cancelled') => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status: 'confirmed' | 'cancelled') {
    setUpdating(true);
    await onStatusChange(booking.id, status);
    setUpdating(false);
  }

  const status = statusConfig[booking.payment_status] || statusConfig.pending;
  const shortId = booking.id.substring(0, 8).toUpperCase();

  return (
    <>
      <tr
        className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td className="px-4 py-3.5">
          <span className="text-gray-400 text-xs font-mono">#{shortId}</span>
        </td>
        <td className="px-4 py-3.5">
          <p className="text-white text-sm font-medium">{booking.customer_name}</p>
          <p className="text-gray-500 text-xs">{booking.email}</p>
        </td>
        <td className="px-4 py-3.5 text-gray-300 text-sm max-w-[160px]">
          <p className="truncate">{booking.tour_name}</p>
        </td>
        <td className="px-4 py-3.5 text-gray-300 text-sm whitespace-nowrap">
          {booking.date
            ? new Date(booking.date).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </td>
        <td className="px-4 py-3.5 text-gray-300 text-sm text-center">
          {booking.num_people}
        </td>
        <td className="px-4 py-3.5 text-sm font-medium text-white whitespace-nowrap">
          {formatCOP(booking.total_cop || 0)}
        </td>
        <td className="px-4 py-3.5">
          <Badge className={`text-xs border ${status.className}`}>
            {status.label}
          </Badge>
        </td>
        <td className="px-4 py-3.5 pr-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            {booking.payment_status !== 'confirmed' && (
              <Button
                onClick={() => updateStatus('confirmed')}
                disabled={updating}
                size="sm"
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 h-7 px-2 text-xs gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Confirmar
              </Button>
            )}
            {booking.payment_status !== 'cancelled' && (
              <Button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                size="sm"
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 h-7 px-2 text-xs gap-1"
              >
                <XCircle className="w-3 h-3" />
                Cancelar
              </Button>
            )}
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="p-1 text-gray-500 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-gray-800">
          <td colSpan={8} className="px-4 py-4 bg-gray-800/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Contacto</p>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{booking.email}</span>
                </div>
                {booking.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span>{booking.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Reserva</p>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  <span>{booking.num_people} personas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    Creada:{' '}
                    {new Date(booking.created_at).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {booking.wompi_transaction_id && (
                  <p className="text-xs text-gray-500 font-mono">
                    Wompi: {booking.wompi_transaction_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Notas</p>
                <div className="flex items-start gap-2 text-sm text-gray-300">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 italic">
                    {booking.notes || 'Sin notas adicionales'}
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ReservacionesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  async function fetchBookings() {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function handleStatusChange(id: string, status: 'confirmed' | 'cancelled') {
    const { error: err } = await supabase
      .from('bookings')
      .update({ payment_status: status })
      .eq('id', id);
    if (err) {
      setError(err.message);
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, payment_status: status } : b))
      );
    }
  }

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      search === '' ||
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.tour_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || b.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.payment_status === 'pending').length,
    confirmed: bookings.filter((b) => b.payment_status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.payment_status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h1 className="text-white text-2xl font-bold">Reservaciones</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Gestiona todas las reservas de clientes
          </p>
        </div>
        <Button
          onClick={fetchBookings}
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, email o tour..."
            className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-emerald-600"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'confirmed', 'cancelled'] as StatusFilter[]).map(
            (s) => {
              const labels: Record<StatusFilter, string> = {
                all: 'Todas',
                pending: 'Pendientes',
                confirmed: 'Confirmadas',
                cancelled: 'Canceladas',
              };
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  {labels[s]}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {counts[s]}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Calendar className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">
                {search || statusFilter !== 'all'
                  ? 'No hay resultados para los filtros aplicados'
                  : 'No hay reservaciones aún'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium px-4 py-3">ID</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Cliente</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Tour</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Fecha</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 text-center">Personas</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Total COP</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Estado</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 pr-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => (
                    <BookingDetailRow
                      key={booking.id}
                      booking={booking}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">
                Mostrando {filtered.length} de {bookings.length} reservaciones
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
