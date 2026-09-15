import { createFileRoute } from "@tanstack/react-router";
import { JoinScreen } from "@/screens/join-screen";

type JoinSearch = { p?: string; s?: string };

export const Route = createFileRoute("/join")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): JoinSearch => ({
    p: typeof s.p === "string" ? s.p : undefined,
    s: typeof s.s === "string" ? s.s : undefined,
  }),
  component: JoinScreen,
});
