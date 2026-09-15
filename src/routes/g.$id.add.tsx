import { createFileRoute } from "@tanstack/react-router";
import { AddExpenseScreen } from "@/screens/add-expense-screen";

export const Route = createFileRoute("/g/$id/add")({
  component: AddExpenseScreen,
});
