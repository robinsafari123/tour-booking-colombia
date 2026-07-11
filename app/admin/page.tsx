'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Map,
  Star,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCOP } from '@/components/ToursSection';
import supabase from '@/lib/supabase';

interface Booking {
  id: string;
  customer_name: string;
  tour_name: string;
  date: string;
  num_people: number;
  total_cop: number;
  payment_status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  email: string;
}

interface Tour {
  id: string;
  is_active: boolean;
  rating?: number;
}

interface Stats {
  totalReservaciones: number;
  totalIngresos: number;
  toursActivos: number;
  calificacionPromedio: number;
}

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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
            <p className="text-white text-2xl font-bold truncate">{value}</p>
            {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReservaciones: 0,
    totalIngresos: 0,
    toursActivos: 0,
    calificacionPromedio: 4.8,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      // Fetch last 10 bookings
      const { data: bookingsData, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (bErr) throw bErr;

      // Fetch all bookings for stats
      const { data: allBookings, error: allErr } = await supabase
        .from('bookings')
        .select('total_cop, payment_status');

      if (allErr) throw allErr;

      // Fetch tours
      const { data: toursData, error: tErr } = await supabase
        .from('tours')
        .select('id, is_active, rating');

      if (tErr) throw tErr;

      const confirmedBookings = (allBookings || []).filter(
        (b) => b.payment_status === 'confirmed'
      );
      const totalIngresos = confirmedBookings.reduce(
        (sum, b) => sum + (b.total_cop || 0),
        0
      );
      const toursActivos = (toursData || []).filter((t: Tour) => t.is_active).length;
      const ratings = (toursData || [])
        .map((t: Tour) => t.rating)
        .filter((r): r is number => typeof r === 'number' && r > 0);
      const calificacionPromedio =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 4.8;

      setBookings(bookingsData || []);
      setStats({
        totalReservaciones: (allBookings || []).length,
        totalIngresos,
        toursActivos,
        calificacionPromedio: Math.round(calificacionPromedio * 10) / 10,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const statusCounts = bookings.reduce(
    (acc, b) => {
      acc[b.payment_status] = (acc[b.payment_status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-emerald-500" />
            <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Resumen general de Mavicure Travel Tours
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white gap-2"
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Reservaciones"
          value={stats.totalReservaciones.toString()}
          icon={Users}
          color="bg-blue-600"
          sub={`${statusCounts.pending || 0} pendientes`}
        />
        <StatCard
          label="Ingresos Confirmados"
          value={formatCOP(stats.totalIngresos)}
          icon={TrendingUp}
          color="bg-emerald-600"
          sub="Solo pagos confirmados"
        />
        <StatCard
          label="Tours Activos"
          value={stats.toursActivos.toString()}
          icon={Map}
          color="bg-purple-600"
          sub="Disponibles para reservar"
        />
        <StatCard
          label="Calificación Promedio"
          value={`${stats.calificacionPromedio} / 5.0`}
          icon={Star}
          color="bg-amber-600"
          sub="Basado en reseñas"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="xl:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h2 className="text-white font-semibold">
                  Reservaciones Recientes
                </h2>
                <Link href="/admin/reservaciones">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/10 gap-1"
                  >
                    Ver todas
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Users className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">No hay reservaciones aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-gray-500 font-medium px-6 py-3">
                          Cliente
                        </th>
                        <th className="text-left text-gray-500 font-medium px-4 py-3">
                          Tour
                        </th>
                        <th className="text-left text-gray-500 font-medium px-4 py-3">
                          Fecha
                        </th>
                        <th className="text-left text-gray-500 font-medium px-4 py-3">
                          Personas
                        </th>
                        <th className="text-left text-gray-500 font-medium px-4 py-3">
                          Total
                        </th>
                        <th className="text-left text-gray-500 font-medium px-4 py-3 pr-6">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, i) => {
                        const status =
                          statusConfig[booking.payment_status] ||
                          statusConfig.pending;
                        return (
                          <tr
                            key={booking.id}
                            className={`border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors ${
                              i === bookings.length - 1 ? 'border-b-0' : ''
                            }`}
                          >
                            <td className="px-6 py-3.5">
                              <p className="text-white font-medium truncate max-w-[140px]">
                                {booking.customer_name}
                              </p>
                              <p className="text-gray-500 text-xs truncate max-w-[140px]">
                                {booking.email}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 text-gray-300 max-w-[160px]">
                              <p className="truncate">{booking.tour_name}</p>
                            </td>
                            <td className="px-4 py-3.5 text-gray-300 whitespace-nowrap">
                              {booking.date
                                ? new Date(booking.date).toLocaleDateString('es-CO', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-gray-300 text-center">
                              {booking.num_people}
                            </td>
                            <td className="px-4 py-3.5 text-gray-300 whitespace-nowrap font-medium">
                              {formatCOP(booking.total_cop || 0)}
                            </td>
                            <td className="px-4 py-3.5 pr-6">
                              <Badge
                                className={`text-xs border font-medium ${status.className}`}
                              >
                                {status.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + Summary */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-white font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <Link href="/admin/tours" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-800/80 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                      <Map className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">Gestionar Tours</p>
                      <p className="text-gray-500 text-xs">Agregar o editar tours</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>

                <Link href="/admin/reservaciones" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-800/80 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">Reservaciones</p>
                      <p className="text-gray-500 text-xs">Ver y gestionar reservas</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>

                <Link href="/admin/facturas" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-800/80 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-600/30 transition-colors">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">Facturas</p>
                      <p className="text-gray-500 text-xs">Descargar comprobantes</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Status breakdown */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-white font-semibold mb-4">Estado de Reservas</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-gray-300 text-sm">Pendientes</span>
                  </div>
                  <span className="text-amber-400 font-semibold">
                    {statusCounts.pending || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">Confirmadas</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">
                    {statusCounts.confirmed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300 text-sm">Canceladas</span>
                  </div>
                  <span className="text-red-400 font-semibold">
                    {statusCounts.cancelled || 0}
                  </span>
                </div>

                {/* Bar chart */}
                {stats.totalReservaciones > 0 && (
                  <div className="mt-4 space-y-2">
                    {(['confirmed', 'pending', 'cancelled'] as const).map((s) => {
                      const count = statusCounts[s] || 0;
                      const pct = Math.round(
                        (count / stats.totalReservaciones) * 100
                      );
                      const barColor =
                        s === 'confirmed'
                          ? 'bg-emerald-500'
                          : s === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-red-500';
                      return (
                        <div key={s}>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
