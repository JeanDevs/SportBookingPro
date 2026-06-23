import { Check } from "lucide-react";

interface BookingProgressProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: "Elige horario" },
  { n: 2, label: "Revisa tu reserva" },
  { n: 3, label: "Confirma y paga" },
] as const;

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="mb-7 flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done = step.n < currentStep;
        const active = step.n === currentStep;
        return (
          <div key={step.n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={
                  "grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-bold transition-colors " +
                  (done
                    ? "border-lime-400 bg-lime-400 text-ink-950"
                    : active
                      ? "border-lime-400 bg-transparent text-lime-300"
                      : "border-ink-700 bg-transparent text-ink-500")
                }
              >
                {done ? <Check size={15} strokeWidth={3} /> : step.n}
              </div>
              <span
                className={
                  "mt-1.5 hidden text-xs sm:block " +
                  (active ? "font-semibold text-lime-200" : done ? "text-lime-400" : "text-ink-500")
                }
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={
                  "mb-3.5 h-px flex-1 mx-1 sm:mx-2 transition-colors " +
                  (step.n < currentStep ? "bg-lime-400/60" : "bg-ink-700")
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
