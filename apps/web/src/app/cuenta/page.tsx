import { getMyBookings } from "@/services/customer-bookings";
import { getCustomerUser } from "@/services/customer-auth";
import { CuentaView } from "./cuenta-view";

export default async function CuentaPage() {
  const [bookings, user] = await Promise.all([getMyBookings(), getCustomerUser()]);
  const name = (user?.user_metadata?.full_name as string | undefined) ?? "Tu cuenta";
  return <CuentaView bookings={bookings} name={name} />;
}
