import { createFileRoute } from "@tanstack/react-router";
import { QuickScreen } from "@/screens/quick-screen";

export const Route = createFileRoute("/quick")({ component: QuickScreen });
