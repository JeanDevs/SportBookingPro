import { listFields } from "@/services/fields";
import { CanchasView } from "./canchas-view";

export default async function CanchasPage() {
  const fields = await listFields();
  return <CanchasView fields={fields} />;
}
