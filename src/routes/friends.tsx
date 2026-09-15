import { createFileRoute } from "@tanstack/react-router";
import { FriendsScreen } from "@/screens/friends-screen";

export const Route = createFileRoute("/friends")({
  component: FriendsScreen,
});
