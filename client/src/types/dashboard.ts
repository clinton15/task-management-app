export type Project = {
  _id: string;
  name: string;
  members: string[];
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
};

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string | { _id: string; name: string } | null;
  createdAt?: string;
  order?: number;
};

export const STATUS_OPTIONS: TaskStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];
