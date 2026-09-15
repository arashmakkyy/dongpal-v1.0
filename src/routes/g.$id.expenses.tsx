import { createFileRoute } from "@tanstack/react-router";
import { ExpensesScreen } from "@/screens/expenses-screen";

export const Route = createFileRoute("/g/$id/expenses")({
  component: ExpensesScreen,
});
