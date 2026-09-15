import { createFileRoute } from "@tanstack/react-router";
import { SplitScreen } from "@/screens/split-screen";

export const Route = createFileRoute("/g/$id/split")({
  validateSearch: (s: Record<string, unknown>) => ({
    from: typeof s.from === "string" ? s.from : undefined,
  }),
  component: SplitScreen,
});
