import { getFacilitySettings, getFieldsAvailability } from "@/services/settings";
import { ConfiguracionView } from "./configuracion-view";

export default async function ConfiguracionPage() {
  const [settings, availability] = await Promise.all([
    getFacilitySettings(),
    getFieldsAvailability(),
  ]);

  if (!settings) {
    return <div className="p-8 text-ink-300">No se encontró tu complejo.</div>;
  }

  return <ConfiguracionView settings={settings} availability={availability} />;
}
