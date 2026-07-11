import { Resend } from 'resend';
import { getConfig } from './gateway-config';

export interface BookingEmailData {
  to: string;
  customerName: string;
  tourName: string;
  date: string;
  numPeople: number;
  totalCop: number;
  gateway: string;
  reference: string;
}

const gatewayNames: Record<string, string> = {
  wompi: 'Wompi (Bancolombia)',
  payu: 'PayU',
  mercadopago: 'Mercado Pago',
  paypal: 'PayPal',
};

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export async function buildBookingConfirmationHtml(
  data: Omit<BookingEmailData, 'to'>,
): Promise<string> {
  const { customerName, tourName, date, numPeople, totalCop, gateway, reference } = data;

  const waRaw = await getConfig('contact_whatsapp') || '573001234567';
  const waNum = waRaw.replace(/\D/g, '');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Confirmada</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#047857);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Mavicure Travel Tours</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">¡Reserva Confirmada!</h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Tu aventura por Colombia está asegurada</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hola <strong>${customerName}</strong>,</p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Tu pago fue procesado exitosamente y tu reserva ha sido confirmada. Aquí están los detalles:
              </p>

              <!-- Booking details box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="color:#6b7280;font-size:13px;">Tour</span><br>
                          <strong style="color:#111827;font-size:15px;">${tourName}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="color:#6b7280;font-size:13px;">Fecha</span><br>
                          <strong style="color:#111827;font-size:15px;">${formatDate(date)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="color:#6b7280;font-size:13px;">Personas</span><br>
                          <strong style="color:#111827;font-size:15px;">${numPeople} ${numPeople === 1 ? 'persona' : 'personas'}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="color:#6b7280;font-size:13px;">Total pagado</span><br>
                          <strong style="color:#059669;font-size:18px;">${formatCOP(totalCop)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                          <span style="color:#6b7280;font-size:13px;">Método de pago</span><br>
                          <strong style="color:#111827;font-size:15px;">${gatewayNames[gateway] ?? gateway}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="color:#6b7280;font-size:13px;">Referencia</span><br>
                          <code style="color:#374151;font-size:13px;background:#e5e7eb;padding:2px 6px;border-radius:4px;">${reference}</code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">
                Nos pondremos en contacto contigo próximamente con los detalles del tour y las instrucciones de preparación.
              </p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:14px;line-height:1.6;">
                ¿Tienes preguntas? Escríbenos por WhatsApp o responde a este correo.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/${waNum}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600;font-size:15px;">
                      Contactar por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Mavicure Travel Tours · Colombia<br>
                Este correo fue enviado porque realizaste una reserva en mavicuretravel.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping confirmation email');
    return;
  }

  const resend = new Resend(resendKey);
  const from = await getConfig('EMAIL_FROM') || 'bookings@mavicuretraveltours.com';
  const { to, ...rest } = data;

  const html = await buildBookingConfirmationHtml(rest);

  await resend.emails.send({
    from,
    to,
    subject: `Reserva confirmada: ${rest.tourName}`,
    html,
  });
}
