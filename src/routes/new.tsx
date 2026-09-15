import { createFileRoute } from "@tanstack/react-router";
import { NewGatheringScreen } from "@/screens/new-gathering-screen";

export const Route = createFileRoute("/new")({
  component: NewGatheringScreen,
});
