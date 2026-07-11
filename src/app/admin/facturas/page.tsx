'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

function invoiceNumber(id: string, created_at: string) {
  const year = new Date(created_at).getFullYear();
  const seq = id.substring(0, 6).toUpperCase();
  return `FAC-${year}-${seq}`;
}

function generateInvoiceHTML(booking: Booking): string {
  const invNum = invoiceNumber(booking.id, booking.created_at);
  const subtotal = Math.round(booking.total_cop / 1.19);
  const iva = booking.total_cop - subtotal;
  const dateStr = booking.date
    ? new Date(booking.date).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';
  const createdStr = new Date(booking.created_at).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Factura ${invNum}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 48px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid #059669;
    }
    .logo-block { display: flex; flex-direction: column; gap: 4px; }
    .logo-icon {
      width: 48px; height: 48px;
      background: #059669;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
    }
    .logo-icon svg { width: 24px; height: 24px; fill: white; }
    .company-name { font-size: 20px; font-weight: 700; color: #059669; }
    .company-details { color: #6b7280; font-size: 11px; line-height: 1.6; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #111827; }
    .invoice-num { color: #059669; font-size: 14px; font-weight: 600; margin-top: 4px; }
    .invoice-date { color: #6b7280; font-size: 11px; margin-top: 6px; }
    .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
    .section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px;
    }
    .section-value { font-size: 13px; line-height: 1.7; color: #374151; }
    .section-value strong { color: #111827; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f0fdf4; }
    th {
      padding: 10px 14px; text-align: left;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #059669;
      border-bottom: 2px solid #d1fae5;
    }
    td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; color: #374151; }
    tr:last-child td { border-bottom: none; }
    .totals {
      margin-left: auto; width: 280px;
      border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;
    }
    .totals-row { display: flex; justify-content: space-between; padding: 10px 16px; }
    .totals-row:not(:last-child) { border-bottom: 1px solid #f3f4f6; }
    .totals-label { color: #6b7280; font-size: 12px; }
    .totals-value { font-weight: 600; color: #111827; font-size: 12px; }
    .totals-total { background: #059669; }
    .totals-total .totals-label,
    .totals-total .totals-value { color: white; font-size: 14px; font-weight: 700; }
    .status-badge {
      display: inline-block; padding: 3px 10px; border-radius: 99px;
      font-size: 11px; font-weight: 600; background: #d1fae5; color: #059669;
    }
    .footer {
      margin-top: 48px; padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-left { color: #9ca3af; font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #059669; font-weight: 700; font-size: 12px; }
    @media print {
      body { padding: 24px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-block">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      </div>
      <div class="company-name">Mavicure Travel Tours</div>
      <div class="company-details">
        Bogotá, Colombia<br/>
        contacto@mavicure.com.co<br/>
        +57 310 000 0000<br/>
        NIT: 900.000.000-0
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-num">${invNum}</div>
      <div class="invoice-date">Emitida: ${createdStr}</div>
      <div style="margin-top:8px"><span class="status-badge">Pagada</span></div>
    </div>
  </div>

  <div class="sections">
    <div>
      <div class="section-label">Facturado a</div>
      <div class="section-value">
        <strong>${booking.customer_name}</strong><br/>
        ${booking.email}<br/>
        ${booking.phone || ''}
      </div>
    </div>
    <div>
      <div class="section-label">Detalles de pago</div>
      <div class="section-value">
        <strong>Estado:</strong> Confirmado<br/>
        <strong>Método:</strong> Wompi${booking.wompi_transaction_id ? `<br/><strong>Trans. ID:</strong> ${booking.wompi_transaction_id}` : ''}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Destino</th>
        <th>Fecha del tour</th>
        <th>Personas</th>
        <th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${booking.tour_name}</strong></td>
        <td>Colombia</td>
        <td>${dateStr}</td>
        <td>${booking.num_people} persona${booking.num_people !== 1 ? 's' : ''}</td>
        <td style="text-align:right;font-weight:600">${formatCOP(booking.total_cop)}</td>
      </tr>
      ${
        booking.notes
          ? `<tr><td colspan="5" style="color:#6b7280;font-style:italic;font-size:12px">Notas: ${booking.notes}</td></tr>`
          : ''
      }
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span class="totals-label">Subtotal (sin IVA)</span>
      <span class="totals-value">${formatCOP(subtotal)}</span>
    </div>
    <div class="totals-row">
      <span class="totals-label">IVA (19%)</span>
      <span class="totals-value">${formatCOP(iva)}</span>
    </div>
    <div class="totals-row totals-total">
      <span class="totals-label">Total COP</span>
      <span class="totals-value">${formatCOP(booking.total_cop)}</span>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      <div class="footer-brand">Mavicure Travel Tours</div>
      Gracias por confiar en nosotros para su aventura colombiana.<br/>
      Esta factura es un documento oficial de pago.<br/>
      Para consultas: contacto@mavicure.com.co
    </div>
    <div style="text-align:right;color:#9ca3af;font-size:11px">
      ${invNum}<br/>
      Generada el ${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;
}

function openInvoice(booking: Booking) {
  const html = generateInvoiceHTML(booking);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export default function FacturasPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tourFilter, setTourFilter] = useState('');

  async function fetchBookings() {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('bookings')
      .select('*')
      .in('payment_status', ['confirmed'])
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

  const uniqueTours = Array.from(
    new Set(bookings.map((b) => b.tour_name).filter(Boolean))
  ).sort();

  const filtered = bookings.filter((b) => {
    const matchSearch =
      search === '' ||
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      invoiceNumber(b.id, b.created_at).toLowerCase().includes(search.toLowerCase());
    const matchTour = tourFilter === '' || b.tour_name === tourFilter;
    const bDate = b.created_at ? new Date(b.created_at) : null;
    const matchFrom = !dateFrom || (bDate && bDate >= new Date(dateFrom));
    const matchTo = !dateTo || (bDate && bDate <= new Date(dateTo + 'T23:59:59'));
    return matchSearch && matchTour && matchFrom && matchTo;
  });

  const totalFacturado = filtered.reduce((sum, b) => sum + (b.total_cop || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h1 className="text-white text-2xl font-bold">Facturas</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Reservaciones confirmadas y comprobantes de pago
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente o factura..."
            className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-0">
          <select
            value={tourFilter}
            onChange={(e) => setTourFilter(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">Todos los tours</option>
            {uniqueTours.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-900 border-gray-700 text-gray-300"
            placeholder="Desde"
          />
        </div>

        <div>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-gray-900 border-gray-700 text-gray-300"
            placeholder="Hasta"
          />
        </div>
      </div>

      {/* Summary */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between bg-emerald-600/10 border border-emerald-600/20 rounded-xl px-5 py-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <FileText className="w-4 h-4" />
            <span>
              <strong>{filtered.length}</strong> factura{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-emerald-400 text-sm font-semibold">
            Total: {formatCOP(totalFacturado)}
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">
                {search || tourFilter || dateFrom || dateTo
                  ? 'No hay facturas con los filtros aplicados'
                  : 'No hay facturas confirmadas aún'}
              </p>
              <p className="text-sm mt-1 text-gray-600">
                Solo se muestran reservaciones con estado &quot;Confirmado&quot;
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium px-4 py-3">
                      N° Factura
                    </th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">
                      Cliente
                    </th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">
                      Tour
                    </th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">
                      Fecha Tour
                    </th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">
                      Emitida
                    </th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">
                      Personas
                    </th>
                    <th className="text-right text-gray-500 font-medium px-4 py-3">
                      Monto COP
                    </th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 pr-4">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking, i) => {
                    const invNum = invoiceNumber(booking.id, booking.created_at);
                    return (
                      <tr
                        key={booking.id}
                        className={`border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors ${
                          i === filtered.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <span className="text-emerald-400 text-xs font-mono font-semibold">
                            {invNum}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-white text-sm font-medium">
                            {booking.customer_name}
                          </p>
                          <p className="text-gray-500 text-xs">{booking.email}</p>
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm max-w-[180px]">
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
                        <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(booking.created_at).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-gray-300 text-sm text-center">
                          {booking.num_people}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-white font-semibold text-sm">
                            {formatCOP(booking.total_cop || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 pr-4">
                          <Button
                            onClick={() => openInvoice(booking)}
                            size="sm"
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 h-7 px-2.5 text-xs gap-1.5"
                          >
                            <Download className="w-3 h-3" />
                            Descargar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
              <p className="text-gray-500 text-xs">
                {filtered.length} factura{filtered.length !== 1 ? 's' : ''} — Solo reservaciones confirmadas
              </p>
              <p className="text-gray-400 text-xs font-medium">
                Total mostrado: <span className="text-emerald-400">{formatCOP(totalFacturado)}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
