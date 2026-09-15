import { createFileRoute } from "@tanstack/react-router";
import { JoinScreen } from "@/screens/join-screen";

export const Route = createFileRoute("/join")({ component: JoinScreen });
