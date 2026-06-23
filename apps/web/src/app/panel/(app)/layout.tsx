import type { ReactNode } from "react";
import { getMyFacility } from "@/services/facilities";
import { OwnerShell } from "@/components/panel/owner-shell";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const facility = await getMyFacility();
  return <OwnerShell facilityName={facility?.name ?? "Mi complejo"}>{children}</OwnerShell>;
}
