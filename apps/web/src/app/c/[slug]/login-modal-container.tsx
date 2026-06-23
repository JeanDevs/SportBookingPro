"use client";

import { useEffect, useState } from "react";
import { LoginModal } from "@/components/public/login-modal";
import { trackLoginModalShown } from "@/lib/analytics";

interface LoginModalContainerProps {
  facilityName: string;
  facilityId: string;
}

/**
 * Client wrapper for LoginModal that handles state and analytics.
 * Shows modal once on page load for non-logged-in users.
 */
export function LoginModalContainer({
  facilityName,
  facilityId,
}: LoginModalContainerProps) {
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Show modal once on mount
  useEffect(() => {
    if (!hasShown) {
      // Delay modal show slightly to avoid jarring UX
      const timer = setTimeout(() => {
        setOpen(true);
        setHasShown(true);
        trackLoginModalShown(facilityId, facilityName);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasShown, facilityId, facilityName]);

  return (
    <LoginModal
      open={open}
      onClose={() => setOpen(false)}
      facilityName={facilityName}
    />
  );
}
