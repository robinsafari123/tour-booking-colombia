# Mavicure Travel — Launch Checklist

Complete each phase in order. Check off items as you go.

---

## Phase 1 — Supabase Migration

Run in **Supabase Dashboard → SQL Editor**:

**Step 1a — First-time setup** (skip if tables already exist)
Run the full contents of `lib/supabase-schema.sql`.

**Step 1b — Payment columns migration** (always safe to re-run)
```sql
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_gateway  text,
  ADD COLUMN IF NOT EXISTS payment_method   text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS email_sent       boolean default false;
```

**Verify:** In Supabase Table Editor → `bookings` → confirm the 4 new columns exist.

---

## Phase 2 — Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

### Supabase
| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key (**keep secret**) |

### Wompi
Register at **comercios.wompi.co** → Desarrolladores → Llaves

| Variable | Value format |
|---|---|
| `WOMPI_PUBLIC_KEY` | `pub_prod_...` (production) or `pub_test_...` (sandbox) |
| `WOMPI_PRIVATE_KEY` | `prv_prod_...` or `prv_test_...` |
| `WOMPI_INTEGRITY_KEY` | `prod_integrity_...` or `test_integrity_...` |
| `WOMPI_EVENTS_KEY` | `prod_events_...` or `test_events_...` |

### PayU Colombia
Register at **payulatam.com** → Módulo administrativo → Configuración → Información técnica

| Variable | Notes |
|---|---|
| `PAYU_MERCHANT_ID` | Numeric ID |
| `PAYU_ACCOUNT_ID` | Numeric ID |
| `PAYU_API_KEY` | Used for signature generation |
| `PAYU_API_LOGIN` | Used for API calls |
| `NEXT_PUBLIC_PAYU_TEST` | `true` for sandbox, `false` for production |

### Mercado Pago
Register at **mercadopago.com.co/developers** → Tus integraciones → Credenciales

| Variable | Notes |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | `TEST-...` (sandbox) or `APP_USR-...` (production) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | `TEST-...` or `APP_USR-...` public key |

### PayPal
Register at **developer.paypal.com** → Apps & Credentials → Create App

| Variable | Notes |
|---|---|
| `PAYPAL_CLIENT_ID` | From sandbox or live app |
| `PAYPAL_CLIENT_SECRET` | From sandbox or live app |
| `NEXT_PUBLIC_PAYPAL_ENV` | `sandbox` or `production` |
| `PAYPAL_COP_TO_USD_RATE` | Current TRM — check banrep.gov.co, update periodically |

### Resend (email)
Register at **resend.com** → API Keys → Create key

| Variable | Notes |
|---|---|
| `RESEND_API_KEY` | `re_...` |
| `EMAIL_FROM` | Must match verified domain, e.g. `reservas@mavicuretravel.com` |

### Site URL
| Variable | Example |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mavicuretravel.com` (no trailing slash) |

---

## Phase 3 — Resend Domain Verification

1. Resend Dashboard → Domains → Add domain → enter your domain
2. Add the DNS records Resend provides (SPF, DKIM, DMARC) in your DNS provider
3. Wait for verification (~30 min)
4. Confirm `EMAIL_FROM` matches the verified domain exactly

---

## Phase 4 — Vercel Environment Variables

Option A — CLI:
```bash
vercel env add VARIABLE_NAME production
# repeat for each variable
vercel env pull .env.local  # verify locally
```

Option B — Dashboard: Vercel → Project → Settings → Environment Variables

- Set secret keys (`*_KEY`, `*_SECRET`, `SERVICE_ROLE_KEY`) to **Production** only
- Set `NEXT_PUBLIC_*` to **Production + Preview + Development**

---

## Phase 5 — Webhook URLs (register in each gateway dashboard)

Replace `mavicuretravel.com` with your actual domain.

| Gateway | Dashboard location | URL to register |
|---|---|---|
| **Wompi** | comercios.wompi.co → Desarrolladores → Eventos | `https://mavicuretravel.com/api/payment/wompi/events` |
| **PayU** | Módulo administrativo → Configuración → URL de confirmación | `https://mavicuretravel.com/api/payment/payu/notify` |
| **Mercado Pago** | Developers → Webhooks | `https://mavicuretravel.com/api/payment/mercadopago/webhook` |
| **PayPal** | No webhook needed — capture happens synchronously on redirect | — |

> Wompi: subscribe to the `transaction.updated` event.
> Mercado Pago: subscribe to the `payment` topic.

---

## Phase 6 — Sandbox Testing

Test each gateway end-to-end with test credentials before going live.

**What to verify after each test payment:**
- [ ] Supabase `bookings` row: `payment_status = 'confirmed'`
- [ ] `payment_gateway`, `payment_reference` columns are populated
- [ ] `email_sent = true`
- [ ] Confirmation email received in inbox (not spam)
- [ ] `/pago-exitoso` page shows correct booking details

### Wompi sandbox
- Use `pub_test_` / `prv_test_` keys
- Test card: `4242 4242 4242 4242`, any future date, any CVV

### PayU sandbox
- Set `NEXT_PUBLIC_PAYU_TEST=true`
- Test card: `4097 6400 0000 0004` (Visa approved), CVV `444`, exp `12/2025`
- More test cards: developers.payulatam.com → Test your solution

### Mercado Pago sandbox
- Use `TEST-` prefixed credentials
- Create test buyer at: `https://api.mercadopago.com/users/test`

### PayPal sandbox
- Set `NEXT_PUBLIC_PAYPAL_ENV=sandbox`
- Create sandbox buyer at developer.paypal.com → Sandbox → Accounts

---

## Phase 7 — Production Flip

- [ ] Replace all test keys with production keys in Vercel env vars
- [ ] Set `NEXT_PUBLIC_PAYU_TEST=false`
- [ ] Set `NEXT_PUBLIC_PAYPAL_ENV=production`
- [ ] Redeploy: push to main or run `vercel --prod`
- [ ] Run one live low-value transaction per gateway to confirm
- [ ] Confirm `PAYPAL_COP_TO_USD_RATE` is set to the current TRM

---

## Phase 8 — Final Verification

- [ ] `npm run build` completes with no errors
- [ ] `/reservar` loads correctly (not redirecting to /tours)
- [ ] Booking form submits and creates a Supabase row
- [ ] All 4 payment gateways redirect to their checkout
- [ ] Returning from checkout lands on `/pago-exitoso` with correct data
- [ ] Admin panel `/admin` shows bookings and allows manual status update
- [ ] Confirmation email delivered for each gateway
- [ ] `vercel env ls` shows all expected variables in Production scope
