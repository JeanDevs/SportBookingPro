import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { getPublicFacility } from "@/services/public-catalog";
import { getCustomerUser } from "@/services/customer-auth";
import { SiteHeader, SiteFooter } from "@/components/public/site-header";
import { limaDateInput } from "@/lib/format";
import { BookingView } from "./booking-view";

export default async function FacilityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const facility = await getPublicFacility(slug);
  if (!facility) notFound();

  const user = await getCustomerUser();

  return (
    <>
      <SiteHeader />
      <section className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-lime-radial opacity-70" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <h1 className="font-display text-3xl font-bold text-ink-50 sm:text-4xl">{facility.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-300">
            {facility.district || facility.address ? (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-lime-400" />
                {[facility.district, facility.address].filter(Boolean).join(" · ")}
              </span>
            ) : null}
            {facility.phone ? (
              <span className="flex items-center gap-1.5">
                <Phone size={15} className="text-lime-400" />
                {facility.phone}
              </span>
            ) : null}
          </div>
          {facility.description ? (
            <p className="mt-4 max-w-2xl text-ink-300">{facility.description}</p>
          ) : null}
        </div>
      </section>

      <BookingView
        slug={facility.slug}
        facilityName={facility.name}
        depositPercentage={facility.depositPercentage}
        fields={facility.fields}
        isLoggedIn={Boolean(user)}
        today={limaDateInput()}
      />

      <SiteFooter />
    </>
  );
}
