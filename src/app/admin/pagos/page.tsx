'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminFetch } from '@/lib/admin-fetch';

// ─── Gateway definitions ────────────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  secret: boolean;
  hint?: string;
}

interface GatewayDef {
  id: string;
  name: string;
  description: string;
  color: string;
  docsUrl: string;
  fields: FieldDef[];
}

const GATEWAYS: GatewayDef[] = [
  {
    id: 'wompi',
    name: 'Wompi',
    description: 'Bancolombia · Tarjeta, PSE, Nequi, Daviplata',
    color: '#00C3A5',
    docsUrl: 'https://comercios.wompi.co',
    fields: [
      { key: 'WOMPI_PUBLIC_KEY',    label: 'Llave pública',      placeholder: 'pub_prod_...',         secret: false },
      { key: 'WOMPI_PRIVATE_KEY',   label: 'Llave privada',      placeholder: 'prv_prod_...',         secret: true  },
      { key: 'WOMPI_INTEGRITY_KEY', label: 'Llave de integridad', placeholder: 'prod_integrity_...',  secret: true  },
      { key: 'WOMPI_EVENTS_KEY',    label: 'Llave de eventos',   placeholder: 'prod_events_...',      secret: true,
        hint: 'Webhook URL: /api/payment/wompi/events' },
    ],
  },
  {
    id: 'payu',
    name: 'PayU',
    description: 'Tarjeta, PSE, Efecty, Baloto · Colombia e internacional',
    color: '#1B3A6B',
    docsUrl: 'https://developers.payulatam.com',
    fields: [
      { key: 'PAYU_MERCHANT_ID', label: 'Merchant ID',  placeholder: '508029',       secret: false },
      { key: 'PAYU_ACCOUNT_ID',  label: 'Account ID',   placeholder: '512321',       secret: false },
      { key: 'PAYU_API_KEY',     label: 'API Key',       placeholder: '4Vj8eK4r...', secret: true  },
      { key: 'PAYU_API_LOGIN',   label: 'API Login',     placeholder: 'pRRXKOl8...', secret: true  },
      { key: 'NEXT_PUBLIC_PAYU_TEST', label: 'Modo sandbox', placeholder: 'true / false', secret: false,
        hint: 'Usa "true" para pruebas, "false" para producción' },
    ],
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Tarjeta, wallet, PSE · Latinoamérica e internacional',
    color: '#00B1EA',
    docsUrl: 'https://www.mercadopago.com.co/developers',
    fields: [
      { key: 'MERCADOPAGO_ACCESS_TOKEN',          label: 'Access Token',  placeholder: 'APP_USR-...',  secret: true  },
      { key: 'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY', label: 'Public Key',   placeholder: 'APP_USR-...',  secret: false,
        hint: 'Webhook URL: /api/payment/mercadopago/webhook' },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Tarjeta internacional y PayPal · USD / EUR',
    color: '#003087',
    docsUrl: 'https://developer.paypal.com',
    fields: [
      { key: 'PAYPAL_CLIENT_ID',         label: 'Client ID',      placeholder: 'AXxxx...',    secret: false },
      { key: 'PAYPAL_CLIENT_SECRET',     label: 'Client Secret',  placeholder: 'EHxxx...',    secret: true  },
      { key: 'NEXT_PUBLIC_PAYPAL_ENV',   label: 'Entorno',        placeholder: 'sandbox / production', secret: false,
        hint: 'Usa "sandbox" para pruebas, "production" para producción' },
      { key: 'PAYPAL_COP_TO_USD_RATE',   label: 'TRM COP→USD',   placeholder: '4100',         secret: false,
        hint: 'Tasa de cambio actual. Verificar en banrep.gov.co' },
    ],
  },
  {
    id: 'resend',
    name: 'Resend (Email)',
    description: 'Envío de correos de confirmación a clientes',
    color: '#6366f1',
    docsUrl: 'https://resend.com',
    fields: [
      { key: 'RESEND_API_KEY', label: 'API Key', placeholder: 're_...',                      secret: true  },
      { key: 'EMAIL_FROM',     label: 'Correo remitente', placeholder: 'reservas@tudominio.com', secret: false,
        hint: 'Debe coincidir con un dominio verificado en Resend' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function isMasked(value: string) {
  return value.includes('••••');
}

function allKeysConfigured(gateway: GatewayDef, saved: Record<string, string>) {
  return gateway.fields.every((f) => !!saved[f.key]);
}

// ─── Field component ────────────────────────────────────────────────────────

function SecretField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const masked = isMasked(value);

  return (
    <div className='space-y-1.5'>
      <Label className='text-gray-300 text-xs'>{field.label}</Label>
      <div className='relative'>
        <Input
          type={show || !field.secret ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={masked ? '(guardado — escribe para reemplazar)' : field.placeholder}
          className='bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 text-sm pr-10'
        />
        {field.secret && (
          <button
            type='button'
            onClick={() => setShow((s) => !s)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300'
          >
            {show ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
          </button>
        )}
      </div>
      {field.hint && <p className='text-xs text-gray-500'>{field.hint}</p>}
    </div>
  );
}

// ─── Gateway card ────────────────────────────────────────────────────────────

function GatewayCard({
  gateway,
  saved,
  onSaved,
}: {
  gateway: GatewayDef;
  saved: Record<string, string>;
  onSaved: (updates: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<'ok' | 'error' | null>(null);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  const configured = allKeysConfigured(gateway, saved);
  const enabledKey = `${gateway.id.toUpperCase()}_ENABLED`;
  const enabledVal = saved[enabledKey];
  const enabled = gateway.id === 'resend' ? true : (enabledVal === '' || enabledVal === undefined || enabledVal === 'true');

  async function handleToggleEnabled(e: React.MouseEvent) {
    e.stopPropagation();
    setTogglingEnabled(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [enabledKey]: enabled ? 'false' : 'true' }),
      });
      if (!res.ok) throw new Error('Error');
      onSaved({ [enabledKey]: enabled ? 'false' : 'true' });
    } catch {
      // silently ignore — toggle reverts to prior state
    } finally {
      setTogglingEnabled(false);
    }
  }

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setResult(null);
  }

  async function handleSave() {
    setSaving(true);
    setResult(null);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Error');
      setResult('ok');
      onSaved(values);
      // Clear local state so saved values reload from server
      setValues({});
      setTimeout(() => setResult(null), 3000);
    } catch {
      setResult('error');
    } finally {
      setSaving(false);
    }
  }

  const hasEdits = Object.values(values).some((v) => v.trim() !== '');

  return (
    <div className='bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden'>
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className='w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-800/50 transition-colors'
      >
        <span className='w-3 h-3 rounded-full shrink-0' style={{ background: gateway.color }} />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='text-white font-semibold text-sm'>{gateway.name}</span>
            {configured ? (
              <span className='flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full'>
                <CheckCircle2 className='w-3 h-3' /> Conectado
              </span>
            ) : (
              <span className='flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full'>
                <AlertCircle className='w-3 h-3' /> Sin configurar
              </span>
            )}
          </div>
          <p className='text-gray-500 text-xs mt-0.5 truncate'>{gateway.description}</p>
        </div>
        {gateway.id !== 'resend' && (
          <button
            onClick={handleToggleEnabled}
            disabled={togglingEnabled}
            title={enabled ? 'Desactivar pasarela' : 'Activar pasarela'}
            className='relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:opacity-50 focus:outline-none'
            style={{ background: enabled ? '#10b981' : '#374151' }}
          >
            <span
              className='inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5'
              style={{ transform: enabled ? 'translateX(1.125rem)' : 'translateX(0.125rem)' }}
            />
          </button>
        )}
        {open ? <ChevronUp className='w-4 h-4 text-gray-500 shrink-0' /> : <ChevronDown className='w-4 h-4 text-gray-500 shrink-0' />}
      </button>

      {/* Body */}
      {open && (
        <div className='px-6 pb-6 border-t border-gray-800 pt-5 space-y-4'>
          <a
            href={gateway.docsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2'
          >
            Obtener credenciales → {gateway.docsUrl}
          </a>

          {gateway.fields.map((field) => (
            <SecretField
              key={field.key}
              field={field}
              value={values[field.key] ?? saved[field.key] ?? ''}
              onChange={(v) => setValue(field.key, v)}
            />
          ))}

          <div className='flex items-center gap-3 pt-2'>
            <Button
              onClick={handleSave}
              disabled={saving || !hasEdits}
              className='bg-emerald-600 hover:bg-emerald-700 text-white text-sm gap-2'
            >
              {saving
                ? <><Loader2 className='w-4 h-4 animate-spin' /> Guardando...</>
                : <><Save className='w-4 h-4' /> Guardar</>}
            </Button>
            {result === 'ok' && (
              <span className='flex items-center gap-1 text-emerald-400 text-sm'>
                <CheckCircle2 className='w-4 h-4' /> Guardado correctamente
              </span>
            )}
            {result === 'error' && (
              <span className='flex items-center gap-1 text-red-400 text-sm'>
                <AlertCircle className='w-4 h-4' /> Error al guardar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PagosPage() {
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setSaved(data))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(updates: Record<string, string>) {
    setSaved((prev) => ({ ...prev, ...updates }));
  }

  const connectedCount = GATEWAYS.filter((g) => allKeysConfigured(g, saved)).length;

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-white text-2xl font-bold'>Pasarelas de pago</h1>
        <p className='text-gray-400 text-sm mt-1'>
          Conecta tus métodos de pago. Las credenciales se guardan de forma segura en la base de datos.
        </p>
      </div>

      {/* Summary */}
      <div className='bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center gap-4'>
        <div className='text-3xl font-bold text-white'>{connectedCount}<span className='text-gray-600'>/{GATEWAYS.length}</span></div>
        <div>
          <p className='text-white text-sm font-medium'>Pasarelas conectadas</p>
          <p className='text-gray-500 text-xs'>
            {connectedCount === GATEWAYS.length
              ? 'Todo listo para recibir pagos'
              : 'Configura las pasarelas faltantes para activarlas'}
          </p>
        </div>
      </div>

      {/* Gateway cards */}
      {loading ? (
        <div className='flex items-center justify-center py-16'>
          <Loader2 className='w-6 h-6 animate-spin text-emerald-500' />
        </div>
      ) : (
        <div className='space-y-3'>
          {GATEWAYS.map((gw) => (
            <GatewayCard key={gw.id} gateway={gw} saved={saved} onSaved={handleSaved} />
          ))}
        </div>
      )}

      {/* Info box */}
      <div className='bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-xs text-gray-500 space-y-1'>
        <p className='text-gray-400 font-medium'>Webhooks a registrar en cada pasarela:</p>
        <p>Wompi → <code className='text-gray-300'>/api/payment/wompi/events</code></p>
        <p>PayU → <code className='text-gray-300'>/api/payment/payu/notify</code></p>
        <p>Mercado Pago → <code className='text-gray-300'>/api/payment/mercadopago/webhook</code></p>
      </div>
    </div>
  );
}
