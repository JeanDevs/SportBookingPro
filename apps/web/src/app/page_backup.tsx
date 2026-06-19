const reservations = [
  {
    time: "08:00",
    field: "Cancha Futbol 7",
    customer: "Carlos Mendoza",
    status: "Confirmada",
    amount: "S/ 120"
  },
  {
    time: "10:30",
    field: "Cancha Voley",
    customer: "Equipo Las Bravas",
    status: "Adelanto",
    amount: "S/ 45"
  },
  {
    time: "19:00",
    field: "Cancha Tenis 1",
    customer: "Mariana Ruiz",
    status: "Pendiente",
    amount: "S/ 80"
  }
];

const fields = [
  { name: "Futbol 7", status: "Activa", occupancy: "76%" },
  { name: "Voley", status: "Activa", occupancy: "54%" },
  { name: "Tenis 1", status: "Mantenimiento", occupancy: "0%" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#18212f]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-[#d8dee7] bg-[#ffffff] px-5 py-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#697586]">
              APP RESERVAS
            </p>
            <h1 className="mt-2 text-2xl font-bold">La Bombonera</h1>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            {[
              ["Dashboard", "/"],
              ["Reservas", "/reservas"],
              ["Canchas", "#"],
              ["Clientes", "#"],
              ["Pagos", "#"],
              ["Configuracion", "#"]
            ].map(([item, href]) => (
                <a
                  className={`block rounded-md px-3 py-2 ${
                    item === "Dashboard"
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
          <header className="mb-7 flex flex-col gap-4 border-b border-[#d8dee7] pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#697586]">Jueves, 11 de junio</p>
              <h2 className="mt-1 text-3xl font-bold">Operacion de hoy</h2>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border border-[#c9d2df] bg-white px-4 py-2 text-sm font-semibold text-[#263244]">
                <a href="/reservas">Ver calendario</a>
              </button>
              <button className="rounded-md bg-[#d96c2c] px-4 py-2 text-sm font-semibold text-white">
                Nueva reserva
              </button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Reservas hoy", "18", "+4 vs ayer"],
              ["Ingresos mes", "S/ 7,840", "72% cobrado"],
              ["Horas ocupadas", "43", "65% ocupacion"],
              ["Pendiente validar", "S/ 360", "5 adelantos"]
            ].map(([label, value, detail]) => (
              <article className="rounded-lg border border-[#d8dee7] bg-white p-4" key={label}>
                <p className="text-sm font-medium text-[#697586]">{label}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
                <p className="mt-2 text-sm text-[#4b5565]">{detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <section className="rounded-lg border border-[#d8dee7] bg-white">
              <div className="flex items-center justify-between border-b border-[#e4e8ef] px-5 py-4">
                <h3 className="text-lg font-bold">Agenda</h3>
                <span className="rounded-md bg-[#eaf5ef] px-2.5 py-1 text-xs font-semibold text-[#14613d]">
                  30 min
                </span>
              </div>
              <div className="divide-y divide-[#e4e8ef]">
                {reservations.map((reservation) => (
                  <div
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[72px_1fr_120px_90px]"
                    key={`${reservation.time}-${reservation.field}`}
                  >
                    <p className="font-bold text-[#143d2c]">{reservation.time}</p>
                    <div>
                      <p className="font-semibold">{reservation.field}</p>
                      <p className="text-sm text-[#697586]">{reservation.customer}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4b5565]">{reservation.status}</p>
                    <p className="text-sm font-bold">{reservation.amount}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#d8dee7] bg-white">
              <div className="border-b border-[#e4e8ef] px-5 py-4">
                <h3 className="text-lg font-bold">Canchas</h3>
              </div>
              <div className="space-y-4 p-5">
                {fields.map((field) => (
                  <div key={field.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{field.name}</p>
                        <p className="text-sm text-[#697586]">{field.status}</p>
                      </div>
                      <p className="text-sm font-bold">{field.occupancy}</p>
                    </div>
                    <div className="h-2 rounded-full bg-[#e4e8ef]">
                      <div
                        className="h-2 rounded-full bg-[#2c7a57]"
                        style={{ width: field.occupancy }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-[#d8dee7] bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold">Validacion de pagos</h3>
                <p className="mt-1 text-sm text-[#697586]">
                  Adelantos pendientes antes de confirmar reservas.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Yape: S/ 180", "Plin: S/ 120", "Efectivo: S/ 60"].map((item) => (
                  <span className="rounded-md bg-[#fff4e8] px-3 py-2 text-sm font-semibold text-[#8a4817]" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
