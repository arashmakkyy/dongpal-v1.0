import { createFileRoute } from "@tanstack/react-router";
import { SettleScreen } from "@/screens/settle-screen";

export const Route = createFileRoute("/g/$id/settle")({
  component: SettleScreen,
});
