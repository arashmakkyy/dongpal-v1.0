import { createFileRoute } from "@tanstack/react-router";
import { ScanScreen } from "@/screens/scan-screen";

type ScanSearch = { g?: string };

export const Route = createFileRoute("/scan")({
  validateSearch: (s: Record<string, unknown>): ScanSearch => ({
    g: typeof s.g === "string" ? s.g : undefined,
  }),
  component: ScanScreen,
});
