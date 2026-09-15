import { createFileRoute } from "@tanstack/react-router";
import { GatheringScreen } from "@/screens/gathering-screen";

export const Route = createFileRoute("/g/$id/")({
  component: GatheringScreen,
});
