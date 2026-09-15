import { createFileRoute } from "@tanstack/react-router";
import { MoreScreen } from "@/screens/more-screen";

export const Route = createFileRoute("/more")({ component: MoreScreen });
