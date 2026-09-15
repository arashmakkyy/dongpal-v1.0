import { GatheringSyncProvider } from "@/components/gathering-sync";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/g/$id")({
  component: GatheringLayout,
});

function GatheringLayout() {
  const { id } = Route.useParams();
  return (
    <GatheringSyncProvider gatheringId={id}>
      <Outlet />
    </GatheringSyncProvider>
  );
}
