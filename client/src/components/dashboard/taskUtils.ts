import type { TaskStatus } from "../../types/dashboard";

export function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as {
    response?: { data?: { message?: string } };
  };

  return apiError.response?.data?.message ?? fallback;
}

export function formatStatus(status: TaskStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
  }
}

export function getStatusBadgeVariant(status: TaskStatus) {
  switch (status) {
    case "PENDING":
      return "secondary" as const;
    case "IN_PROGRESS":
      return "default" as const;
    case "COMPLETED":
      return "outline" as const;
  }
}
