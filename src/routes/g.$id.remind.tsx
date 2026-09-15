import { createFileRoute } from "@tanstack/react-router";
import { RemindScreen } from "@/screens/remind-screen";

export const Route = createFileRoute("/g/$id/remind")({
  validateSearch: (s: Record<string, unknown>) => ({
    from: typeof s.from === "string" ? s.from : undefined,
    to: typeof s.to === "string" ? s.to : undefined,
    amount: typeof s.amount === "string" ? s.amount : undefined,
  }),
  component: RemindScreen,
});
