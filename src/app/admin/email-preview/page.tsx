import { buildBookingConfirmationHtml } from '@/lib/email';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vista previa del correo — Admin',
};

export default async function EmailPreviewPage() {
  const html = await buildBookingConfirmationHtml({
    customerName: 'Andrea García',
    tourName: 'Tour Caño Cristales 3 días',
    date: '2026-05-15',
    numPeople: 2,
    totalCop: 1_800_000,
    gateway: 'wompi',
    reference: 'MTR-2026-0001',
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Vista previa del correo de confirmación</h1>
          <p className="text-xs text-gray-500 mt-0.5">Así es exactamente lo que recibe el cliente tras pagar</p>
        </div>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
          Datos de ejemplo
        </span>
      </div>
      <iframe
        srcDoc={html}
        className="flex-1 w-full border-0"
        title="Vista previa del correo"
      />
    </div>
  );
}
