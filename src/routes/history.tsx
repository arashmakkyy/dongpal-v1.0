import { createFileRoute } from "@tanstack/react-router";
import { HistoryScreen } from "@/screens/history-screen";

export const Route = createFileRoute("/history")({
  component: HistoryScreen,
});
