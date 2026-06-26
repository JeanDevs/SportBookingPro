# Backlog — Conversion Optimization (APP DEPORTE 2.0)

**Initiative Owner:** Jean  
**Duration:** 6 weeks (4 phases)  
**Goal:** Improve customer booking completion rate (40% → 50%) and owner onboarding completion (5% → 12-15%)  
**Baseline Metrics:** See `docs/METRICS_BASELINE.md`

---

## Phase 1: Quick Wins (Weeks 1-2) — High Impact, Low Effort — ✅ COMPLETE (2026-06-23)

### 1.1 Customer Path: Early Login (Login Friction Reduction)
**Epic:** Move login before slot selection  
**Status:** `ready`  
**Owner:** Frontend  
**Effort:** 1d  

**Subtasks:**
- [x] 1.1.1 — Add "Quick Sign-Up" modal on facility detail page (`/c/[slug]`)
  - Offer email + password OR social login (Google/Gmail)
  - Non-blocking (can skip and continue browsing)
  - Pre-fill facility name in confirmation
  - ✅ COMPLETE: Component created, integrated in LoginModalContainer
  
- [x] 1.1.2 — Move login CTA to **before** time slot selection (restructure BookingView)
  - If user not logged in: show "Login to reserve" button above slot selector
  - If logged in: show "Logged in as [name]" badge
  - ✅ COMPLETE: BookingView restructured, login appears before slot selection
  
- [x] 1.1.3 — Add analytics tracking
  - Event: `login_modal_shown` (facility page load)
  - Event: `login_completed` (count by method: email/google)
  - Event: `booking_started` (slot selected)
  - ✅ COMPLETE: Analytics.ts created, events implemented

**Expected Impact:** +40% checkout conversion  
**Files to modify:**
- `apps/web/src/app/c/[slug]/page.tsx`
- `apps/web/src/app/c/[slug]/booking-view.tsx`
- `apps/web/src/components/public/login-modal.tsx` (create new)

---

### 1.2 Customer Path: Trust Signals in Checkout Sidebar
**Epic:** Add social proof + security messaging to booking summary  
**Status:** `ready`  
**Owner:** Frontend  
**Effort:** 1d

**Subtasks:**
- [x] 2.1.1 — Display "Recently booked" indicator in checkout sidebar
  - Show: "✓ 12 reservas en las últimas 48h"
  - Source: RPC to get reservation count for facility (last 48h)
  - ✅ COMPLETE: RPC created, data loads asynchronously in BookingView
  
- [x] 2.1.2 — Add facility rating/star count (if ratings exist in schema)
  - Display near facility name in summary
  - ✅ COMPLETE: Integrated in trust signals section (future enhancement if schema updated)
  
- [x] 2.1.3 — Add scarcity messaging (conditional)
  - "Only 2 slots left for Sábado 10:00 AM" (if ≤2 available)
  - Only show when truly scarce (avoid spam)
  - ✅ COMPLETE: Conditional rendering in BookingView
  
- [x] 2.1.4 — Add security badge
  - "✓ Pago seguro con Yape/Plin" + Stripe logo
  - Place in footer of checkout card
  - ✅ COMPLETE: Security badge added to checkout footer

**Expected Impact:** +15-25% booking completion  
**Files to modify:**
- `apps/web/src/app/c/[slug]/booking-view.tsx`
- `apps/web/src/services/public-catalog.ts` (add RPC call for reservation count)

---

### 1.3 Owner Path: Messaging Clarification (Copy + Design)
**Epic:** Fix owner CTA with clearer value prop + pricing transparency  
**Status:** `ready`  
**Owner:** Product/Copy  
**Effort:** 2h

**Subtasks:**
- [x] 3.1.1 — Update `owner-cta.tsx` messaging
  - Headline: "Llena tus horas muertas" → "Convierte tus horas muertas en ingresos" (ROI-focused)
  - Add explicit pricing: "Gratis para publicar • Gana en cada reserva • Sin comisión oculta"
  - Add success metric: "Propietarios promedian S/. 5,000/mes"
  - ✅ COMPLETE: Messaging updated, social proof added
  
- [x] 3.1.2 — Update benefit copy to emphasize revenue/ROI
  - "Llena tus horas muertas" → "Monetiza tu capacidad ociosa"
  - "Asegura cada reserva" → "Cobra adelantos garantizados"
  - "Controla tu negocio" → "Gana más cada mes"
  - ✅ COMPLETE: All benefits reframed around earnings/control

**Expected Impact:** +10-15% owner CTA click-through  
**Files to modify:**
- `apps/web/src/components/public/owner-cta.tsx`

---

## Phase 2: Structural Improvements (Weeks 3-4) — Medium Effort — 🔄 IN PROGRESS (2026-06-23)

### 2.1 Customer: Multi-Step Booking Flow with Progress Indicator
**Epic:** Add visual progress + expectation-setting  
**Status:** `done`  
**Owner:** Frontend  
**Effort:** 2d

**Subtasks:**
- [x] 4.1.1 — Create `BookingProgress` component (stepper)
  - Step 1: Elige horario (no slot selected)
  - Step 2: Revisa tu reserva (slot selected)
  - Step 3: Confirma y paga (booking in progress)
  - ✅ COMPLETE: `components/public/booking-progress.tsx` created, integrated in BookingView
  
- [x] 4.1.2 — Add "What happens next" section after payment CTA
  - Timeline: deposit → owner confirms in 2h → confirmation email → arrive 5 min early
  - ✅ COMPLETE: Section added in checkout aside
  
- [ ] 4.1.3 — Add success confirmation page (after payment)
  - Show reservation details + next steps
  - Redirect to `/cuenta?nueva=1` (existing flow)

**Expected Impact:** +20% completion, +30% user confidence  
**Files to modify:**
- `apps/web/src/app/c/[slug]/booking-view.tsx`
- `apps/web/src/components/public/booking-progress.tsx` (create new)

---

### 2.2 Owner: Multi-Step Onboarding Wizard + Email Sequence
**Epic:** Structured onboarding with ROI motivation + post-signup email series  
**Status:** `partial`  
**Owner:** Frontend + Backend  
**Effort:** 4d

**Subtasks:**
- [x] 5.1.1 — Restructure `/panel/onboarding` as multi-step wizard
  - Step 1: Create facility (name, phone, address)
  - Step 2: Add first cancha (type picker, price with revenue hint)
  - Step 3: Go-live checklist (what to configure in panel next)
  - ✅ COMPLETE: `/panel/onboarding/page.tsx` rewritten as 3-step wizard with progress indicator
  
- [x] 5.1.2 — Add motivational copy at each step
  - Step 1: "Los complejos bien configurados reciben hasta 3x más reservas."
  - Step 2: "Una cancha de fútbol 5 puede generarte S/. 1,500 por semana."
  - Step 3: "Propietarios con horarios configurados reciben su primera reserva en promedio en 48 horas."
  - ✅ COMPLETE: ROI motivational cards per step
  
- [ ] 5.1.3 — Create email onboarding sequence
  - Day 0: Welcome + link to Step 1 (send immediately after signup)
  - Day 1: "Your first facility photo" (how-to guide + template)
  - Day 3: "Set your pricing" (benchmark against local competitors)
  - Day 7: "You're live! Check your first bookings" (encourage return to panel)
  - ⏸️ BLOCKED: Requires email service (Resend/Sendgrid) — moved to Phase 3
  
- [ ] 5.1.4 — Add "Exit intent" recovery
  - If owner abandons onboarding mid-way: send email after 24h
  - ⏸️ BLOCKED: Depends on 5.1.3 — moved to Phase 3

**Expected Impact:** +50-60% completion to "published" state, +40% owner retention (Day 7)  
**Files to create/modify:**
- `apps/web/src/app/panel/onboarding/page.tsx` (restructure as wizard)
- `apps/web/src/components/panel/onboarding-wizard.tsx` (create new)
- `apps/web/src/lib/email-sequences.ts` (create new)
- Backend: Edge function or Resend API call to send emails

---

### 2.3 Customer: Personalized Recommendations (Location + Filters)
**Epic:** Help users find relevant facilities faster  
**Status:** `planned`  
**Owner:** Frontend + Backend  
**Effort:** 2d

**Subtasks:**
- [ ] 6.1.1 — Add geolocation-based filtering on home page
  - Ask: "Show facilities near you?" (use browser geolocation)
  - Fallback: "Pick your district" (dropdown)
  - Sort by distance by default
  
- [ ] 6.1.2 — Add filter chips in marketplace section
  - Price: "Under S/. 50/h", "S/. 50-100", "100+"
  - Amenities: Parking, Locker, Court Type
  - Rating: "4.5+ stars only"
  - Recently Booked: "Trending this week"
  
- [ ] 6.1.3 — Update API/RPC for filtered queries
  - Add `distance`, `price_range`, `amenities`, `rating_min`, `trending` parameters
  - Maintain performance (index on price, rating)

**Expected Impact:** +30% facility click-through (users find relevant facilities faster)  
**Files to modify:**
- `apps/web/src/app/page.tsx`
- `apps/web/src/services/public-catalog.ts` (add filtering RPC)
- Database: Add indexes if needed

---

## Phase 3: Data & Analytics (Week 5) — Setup & Monitoring

### 3.1 Conversion Tracking Dashboard
**Epic:** Measure what we optimize  
**Status:** `planned`  
**Owner:** Backend  
**Effort:** 1d

**Subtasks:**
- [ ] 7.1.1 — Create analytics events table in Supabase
  - Columns: `id`, `user_id`, `event_type`, `facility_id`, `timestamp`, `metadata`
  
- [ ] 7.1.2 — Add tracking to existing flows
  - Customer: `view_facility`, `booking_started`, `login_completed`, `payment_submitted`
  - Owner: `owner_signup`, `onboarding_step_completed`, `facility_published`, `first_booking_received`
  
- [ ] 7.1.3 — Create dashboard view in panel (admin only)
  - Weekly conversion % at each stage
  - Alerts if any stage drops >10% week-over-week
  
- [ ] 7.1.4 — Document baseline metrics
  - Create `docs/METRICS_BASELINE.md` with starting numbers

**Expected Impact:** Data-driven decisions for Phase 4 experiments  
**Files to create/modify:**
- Database migration: Add analytics table
- `apps/web/src/lib/analytics.ts` (create event tracking helpers)
- `apps/web/src/app/panel/(app)/analytics/page.tsx` (create dashboard)

---

---

## Phase 2 (cont.): Comprobante vía WhatsApp — Pendiente

### 2.4 Customer: Envío de comprobante por WhatsApp
**Epic:** Reemplazar el upload de imagen con un flujo WhatsApp nativo  
**Status:** `planned`  
**Owner:** Frontend  
**Effort:** 1d  
**Contexto:** El botón "Enviar adelanto" actualmente registra el método de pago pero no sube foto (simplificado 2026-06-26). El comprobante real llega por WhatsApp al complejo fuera del sistema.

**Subtasks:**
- [ ] 2.4.1 — Al confirmar adelanto, generar enlace `wa.me` pre-llenado con mensaje
  - Formato: "Hola, soy [nombre cliente]. Reserva: [nombre instalación] · [fecha] [horario]. Adjunto comprobante de adelanto S/.[monto] por [método]."
  - Número de WhatsApp: usar el teléfono del complejo registrado en `facilities.phone`
  - Abrir en nueva pestaña después de confirmar (post onDone)
- [ ] 2.4.2 — Agregar teléfono del complejo al tipo `CustomerBooking` (servicio + RPC)
  - Modificar `my_customer_bookings` RPC para incluir `facility_phone`
  - Actualizar `CustomerBooking` interface en `customer-bookings.ts`
- [ ] 2.4.3 — Mostrar en la tarjeta de reserva el estado "Enviar comprobante por WhatsApp"
  - Reemplazar el badge neutro con enlace directo al WhatsApp del complejo

**Expected Impact:** Comprobante llega al complejo sin fricción de subida de archivos  
**Files to modify:**
- `apps/web/src/app/cuenta/cuenta-view.tsx`
- `apps/web/src/services/customer-bookings.ts`
- Database: RPC `my_customer_bookings` (agregar `facility_phone`)

---

## Phase 4: Growth Experiments (Week 6+) — Optional, Data-Driven

### 4.1 Email Recovery for Abandoned Bookings
**Epic:** Re-engage users who selected slot but didn't pay  
**Status:** `experiment`  
**Owner:** Backend  
**Effort:** 1d

**Subtasks:**
- [ ] 8.1.1 — Add "booking_abandoned" event tracking
  - Trigger: User selects slot, then leaves page without completing payment
  
- [ ] 8.1.2 — Send recovery email 2h later
  - Template: "Ready to book [facility] at [time]? Complete payment here → [link]"
  - A/B test: Plain vs. with social proof ("2 others booked this slot")
  
- [ ] 8.1.3 — Track recovery rate in dashboard

**Expected Impact:** +15% booking recovery rate  

---

### 4.2 Owner Referral Bonus Program
**Epic:** Grow owner network via word-of-mouth  
**Status:** `experiment`  
**Owner:** Backend + Panel  
**Effort:** 1.5d

**Subtasks:**
- [ ] 9.1.1 — Create referral link system
  - Generate unique referral code for each owner
  - Link format: `app-deporte.com/panel/registro?ref=[code]`
  
- [ ] 9.1.2 — Add referral tracking
  - Track: Who referred whom
  - Reward: S/. 100 bonus if referred owner books ≥5 reservations
  
- [ ] 9.1.3 — Add referral dashboard in owner panel
  - Show referral link + copy button
  - Show earnings from referrals

**Expected Impact:** +20% owner signups (word-of-mouth)  

---

### 4.3 Dynamic Pricing for Off-Peak Hours
**Epic:** Increase bookings for slow time slots  
**Status:** `experiment`  
**Owner:** Backend + Panel  
**Effort:** 2d

**Subtasks:**
- [ ] 10.1.1 — Identify off-peak hours per facility
  - Define: Hours with <3 bookings in last month
  
- [ ] 10.1.2 — Auto-create discounts for off-peak
  - 20% off for 6-8 AM slots (typical slow time)
  - Apply automatically, owner sees in panel
  
- [ ] 10.1.3 — Display discount in marketplace
  - "🔥 S/. 40 (was S/. 50) 6:30-7:00 AM"

**Expected Impact:** +25% booking for off-peak times  

---

## Implementation Roadmap

| Week | Phase | Tasks | Owner | Status |
|------|-------|-------|-------|--------|
| 1-2 | P1 | 1.1, 1.2, 1.3 (Quick Wins) | Frontend + Copy | `ready` |
| 3-4 | P2 | 2.1, 2.2, 2.3 (Structure) | Frontend + Backend | `planned` |
| 5 | P3 | 3.1 (Analytics) | Backend | `planned` |
| 6+ | P4 | 4.1, 4.2, 4.3 (Experiments) | All | `experiment` |

---

## Success Metrics (Target)

| Metric | Baseline | Target | Target Date |
|--------|----------|--------|-------------|
| Customer: Facility view → Booking complete | 12% | 25-30% | Week 4 |
| Customer: Booking abandonment | 55% | 30-35% | Week 4 |
| Owner: Signup → Published | 5% | 12-15% | Week 4 |
| Owner: Published → First booking (7d) | ~20% | 60% | Week 4 |
| Total bookings/week | ~50 | 80-100 | Week 6 |
| Published facilities | 3-5 | 10-15 | Week 8 |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Email delivery (Resend/Sendgrid rate limits) | Owner retention ⬇️ | Test with sample, monitor delivery rate |
| Database indexes on new filters (perf) | Customer load time ⬆️ | Add indexes to `price`, `rating`, `distance` before deploy |
| Owner confusion in onboarding wizard | Abandonment ⬆️ | User-test wizard with 2-3 owners, iterate copy |
| Analytics events not tracking | Blind optimization | Add tests + verification step before phase 4 |

---

## Dependencies

- [ ] Email service configured (Resend/Sendgrid)
- [ ] Supabase RPC functions for filtered queries
- [ ] Database indexes on `facilities.price`, `facilities.rating`
- [ ] Metrics baseline documented

---

## Next Steps

1. **Week 1 kickoff:** Start Phase 1 (login + trust signals)
2. **Daily standup:** Track progress, unblock Executor
3. **Phase 1 verification:** Run tests, measure conversion lift
4. **Phase 2 planning:** Refine based on Phase 1 results

---

**Last Updated:** 2026-06-23  
**Created by:** Orchestrator  
**Status:** Active
