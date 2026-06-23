/**
 * Analytics event tracking for customer booking flow.
 * Events are logged to browser console and sent to analytics service (future integration).
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown> | undefined;
  timestamp: string;
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  const payload = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Log to console for debugging
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    console.log("[Analytics]", payload);
  }

  // TODO: Send to analytics service (Mixpanel, Amplitude, etc.)
  // analytics.track(event, properties);
}

/** Fired when LoginModal is shown on facility page */
export function trackLoginModalShown(facilityId: string, facilityName: string) {
  trackEvent("login_modal_shown", { facilityId, facilityName });
}

/** Fired when user completes login */
export function trackLoginCompleted(method: "email" | "google") {
  trackEvent("login_completed", { method });
}

/** Fired when user starts booking (selects a slot) */
export function trackBookingStarted(fieldId: string, date: string, slotCount: number) {
  trackEvent("booking_started", { fieldId, date, slotCount });
}

/** Fired when user attempts to complete booking */
export function trackBookingAttempted(fieldId: string, amount: number) {
  trackEvent("booking_attempted", { fieldId, amount });
}

/** Fired when booking is successful */
export function trackBookingCompleted(fieldId: string, reservationId: string, amount: number) {
  trackEvent("booking_completed", { fieldId, reservationId, amount });
}

/** Fired when booking fails */
export function trackBookingFailed(fieldId: string, reason: string) {
  trackEvent("booking_failed", { fieldId, reason });
}
