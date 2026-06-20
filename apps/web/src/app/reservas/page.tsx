const hours = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00"
];

const fields = ["Futbol 7", "Voley", "Tenis 1"];

const reservations = [
  {
    id: "r1",
    field: "Futbol 7",
    start: "08:00",
    end: "09:30",
    customer: "Carlos Mendoza",
    status: "CONFIRMED",
    payment: "Adelanto validado",
    amount: "S/ 120"
  },
  {
    id: "r2",
    field: "Voley",
    start: "10:30",
    end: "12:00",
    customer: "Equipo Las Bravas",
    status: "PARTIALLY_PAID",
    payment: "Saldo pendiente",
    amount: "S/ 90"
  },
  {
    id: "r3",
    field: "Futbol 7",
    start: "18:00",
    end: "20:00",
    customer: "Barrio Norte FC",
    status: "AWAITING_DEPOSIT",
    payment: "Esperando adelanto",
    amount: "S/ 240"
  },
  {
    id: "r4",
    field: "Tenis 1",
    start: "19:00",
    end: "20:30",
    customer: "Mariana Ruiz",
    status: "INTENT_CREATED",
    payment: "Bloqueo temporal",
    amount: "S/ 80"
  }
];

const statusStyles: Record<string, string> = {
  CONFIRMED: "border-[#2c7a57] bg-[#eaf5ef] text-[#143d2c]",
  PARTIALLY_PAID: "border-[#d96c2c] bg-[#fff4e8] text-[#8a4817]",
  AWAITING_DEPOSIT: "border-[#9a6bce] bg-[#f2ecfb] text-[#513179]",
  INTENT_CREATED: "border-[#6f7c8f] bg-[#eef2f6] text-[#3d4756]"
};

function getReservation(field: string, hour: string) {
  return reservations.find((reservation) => reservation.field === field && reservation.start === hour);
}

function getSpan(start: string, end: string) {
  const startIndex = hours.indexOf(start);
  const endIndex = hours.indexOf(end);

  if (startIndex === -1 || endIndex === -1) {
    return 1;
  }

  return Math.max(endIndex - startIndex, 1);
}

const selectedReservation = (reservations[2] ?? reservations[0]) as (typeof reservations)[number];

export default function ReservationsPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#18212f]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-[#d8dee7] bg-white px-5 py-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#697586]">
              APP DEPORTE
            </p>
            <h1 className="mt-2 text-2xl font-bold">La Bombonera</h1>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            {[
              ["Dashboard", "/"],
              ["Reservas", "/reservas"],
              ["Canchas", "/fields"],
              ["Clientes", "/customers"],
              ["Pagos", "/payments"],
              ["Configuracion", "/settings"]
            ].map(([item, href]) => (
              <a
                className={`block rounded-md px-3 py-2 ${
                  item === "Reservas"
                    ? "bg-[#143d2c] text-white"
                    : "text-[#4b5565] hover:bg-[#eef2f6]"
                }`}
                href={href}
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="mb-6 flex flex-col gap-4 border-b border-[#d8dee7] pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-[#697586]">Reservas / Calendario</p>
              <h2 className="mt-1 text-3xl font-bold">Jueves, 11 de junio</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-md border border-[#c9d2df] bg-white px-4 py-2 text-sm font-semibold text-[#263244]">
                Dia
              </button>
              <button className="rounded-md border border-[#c9d2df] bg-white px-4 py-2 text-sm font-semibold text-[#263244]">
                Semana
              </button>
              <button className="rounded-md bg-[#d96c2c] px-4 py-2 text-sm font-semibold text-white">
                Nueva reserva
              </button>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="min-w-0 rounded-lg border border-[#d8dee7] bg-white">
              <div className="grid grid-cols-[88px_repeat(3,minmax(210px,1fr))] border-b border-[#e4e8ef]">
                <div className="border-r border-[#e4e8ef] px-4 py-3 text-sm font-semibold text-[#697586]">
                  Hora
                </div>
                {fields.map((field) => (
                  <div className="border-r border-[#e4e8ef] px-4 py-3 last:border-r-0" key={field}>
                    <p className="font-bold">{field}</p>
                    <p className="text-xs font-medium text-[#697586]">Intervalos de 30 min</p>
                  </div>
                ))}
              </div>

              <div className="max-w-full overflow-x-auto">
                <div className="grid min-w-[760px] grid-cols-[88px_repeat(3,minmax(210px,1fr))]">
                  <div className="border-r border-[#e4e8ef]">
                    {hours.map((hour) => (
                      <div className="h-16 border-b border-[#edf0f5] px-4 py-2 text-xs font-semibold text-[#697586]" key={hour}>
                        {hour}
                      </div>
                    ))}
                  </div>

                  {fields.map((field) => (
                    <div className="relative border-r border-[#e4e8ef] last:border-r-0" key={field}>
                      {hours.map((hour) => {
                        const reservation = getReservation(field, hour);

                        return (
                          <div className="relative h-16 border-b border-[#edf0f5] px-2 py-1" key={`${field}-${hour}`}>
                            {reservation ? (
                              <article
                                className={`absolute inset-x-2 z-10 rounded-md border p-3 shadow-sm ${
                                  statusStyles[reservation.status]
                                }`}
                                style={{
                                  height: `calc(${getSpan(reservation.start, reservation.end)} * 4rem - 0.5rem)`
                                }}
                              >
                                <p className="text-xs font-bold">
                                  {reservation.start} - {reservation.end}
                                </p>
                                <p className="mt-1 text-sm font-bold">{reservation.customer}</p>
                                <p className="mt-1 text-xs font-semibold">{reservation.payment}</p>
                              </article>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-lg border border-[#d8dee7] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#697586]">
                  Reserva seleccionada
                </p>
                <h3 className="mt-2 text-2xl font-bold">{selectedReservation.customer}</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#697586]">Cancha</span>
                    <strong>{selectedReservation.field}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#697586]">Horario</span>
                    <strong>
                      {selectedReservation.start} - {selectedReservation.end}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#697586]">Estado</span>
                    <strong>Esperando adelanto</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#697586]">Monto</span>
                    <strong>{selectedReservation.amount}</strong>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <button className="rounded-md bg-[#143d2c] px-4 py-2.5 text-sm font-semibold text-white">
                    Validar adelanto
                  </button>
                  <button className="rounded-md border border-[#c9d2df] bg-white px-4 py-2.5 text-sm font-semibold text-[#263244]">
                    Reprogramar
                  </button>
                  <button className="rounded-md border border-[#efc4c4] bg-[#fff1f1] px-4 py-2.5 text-sm font-semibold text-[#9f2d2d]">
                    Cancelar reserva
                  </button>
                </div>
              </section>

              <section className="rounded-lg border border-[#d8dee7] bg-white p-5">
                <h3 className="text-lg font-bold">Resumen del dia</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["Reservas", "18"],
                    ["Bloqueos", "2"],
                    ["Ocupacion", "65%"],
                    ["Pendiente", "S/ 360"]
                  ].map(([label, value]) => (
                    <div className="rounded-md bg-[#f6f7f9] p-3" key={label}>
                      <p className="text-xs font-semibold text-[#697586]">{label}</p>
                      <p className="mt-1 text-xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#d8dee7] bg-white p-5">
                <h3 className="text-lg font-bold">Estados</h3>
                <div className="mt-4 space-y-2 text-sm font-semibold">
                  <p className="rounded-md bg-[#eaf5ef] px-3 py-2 text-[#143d2c]">Confirmada</p>
                  <p className="rounded-md bg-[#fff4e8] px-3 py-2 text-[#8a4817]">Pago parcial</p>
                  <p className="rounded-md bg-[#f2ecfb] px-3 py-2 text-[#513179]">Esperando adelanto</p>
                  <p className="rounded-md bg-[#eef2f6] px-3 py-2 text-[#3d4756]">Bloqueo temporal</p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
