import { createFileRoute } from "@tanstack/react-router";
import { GatheringsScreen } from "@/screens/gatherings-screen";

export const Route = createFileRoute("/gatherings")({
  component: GatheringsScreen,
});
