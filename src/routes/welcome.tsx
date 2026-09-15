import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/screens/welcome-screen";

export const Route = createFileRoute("/welcome")({ component: WelcomeScreen });
