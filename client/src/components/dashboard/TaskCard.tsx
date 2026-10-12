import { useState } from "react";
import type { FormEvent } from "react";
import type {
  Task,
  TaskStatus,
  User,
} from "../../types/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatStatus,
  getStatusBadgeVariant,
} from "@/components/dashboard/taskUtils";

type TaskCardProps = {
  task: Task;
  users: User[];
  projectUsers: User[];
  isAdmin: boolean;
  updatingTaskId: string;
  deletingTaskId: string;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onUpdate: (
    taskId: string,
    updates: {
      title: string;
      description: string;
      assignedTo: string | null;
    },
  ) => Promise<boolean>;
  onDelete: (taskId: string) => void;
};

const STATUS_OPTIONS: TaskStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];

export default function TaskCard({
  task,
  users,
  projectUsers,
  isAdmin,
  updatingTaskId,
  deletingTaskId,
  onStatusChange,
  onUpdate,
  onDelete,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description ?? "",
  );
  const [editAssignedTo, setEditAssignedTo] = useState(
    typeof task.assignedTo === "string"
      ? task.assignedTo
      : task.assignedTo?._id ?? "",
  );

  const assignedUserId =
    typeof task.assignedTo === "string"
      ? task.assignedTo
      : task.assignedTo?._id;

  const assignedUser = users.find(
    (user) => user._id === assignedUserId,
  );

  const isUpdating = updatingTaskId === task._id;
  const isDeleting = deletingTaskId === task._id;

  function startEditing() {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditAssignedTo(assignedUserId ?? "");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditAssignedTo(assignedUserId ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editTitle.trim()) {
      return;
    }

    const success = await onUpdate(task._id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      assignedTo: editAssignedTo || null,
    });

    if (success) {
      setIsEditing(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor={`edit-title-${task._id}`}
              className="text-sm font-medium"
            >
              Task title
            </label>

            <input
              id={`edit-title-${task._id}`}
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              required
              maxLength={200}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-description-${task._id}`}
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id={`edit-description-${task._id}`}
              value={editDescription}
              onChange={(event) =>
                setEditDescription(event.target.value)
              }
              rows={3}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-assignee-${task._id}`}
              className="text-sm font-medium"
            >
              Assign to
            </label>

            <select
              id={`edit-assignee-${task._id}`}
              value={editAssignedTo}
              onChange={(event) =>
                setEditAssignedTo(event.target.value)
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>

              {projectUsers.map((projectUser) => (
                <option
                  key={projectUser._id}
                  value={projectUser._id}
                >
                  {projectUser.name} ({projectUser.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={cancelEditing}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <h3 className="break-words font-semibold">
                {task.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Assigned to: {assignedUser?.name ?? "Unassigned"}
              </p>

              {task.description && (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
                  {task.description}
                </p>
              )}

              {task.createdAt && (
                <p className="mt-2 text-xs text-slate-400">
                  Created{" "}
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <Badge variant={getStatusBadgeVariant(task.status)}>
              {formatStatus(task.status)}
            </Badge>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`status-${task._id}`}
                className="text-xs font-medium text-slate-500"
              >
                Update status
              </label>

              <select
                id={`status-${task._id}`}
                value={task.status}
                disabled={isUpdating || isDeleting}
                onChange={(event) =>
                  onStatusChange(
                    task,
                    event.target.value as TaskStatus,
                  )
                }
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>

              {isUpdating && (
                <span className="text-xs text-slate-500">
                  Saving changes...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={startEditing}
                disabled={isUpdating || isDeleting}
              >
                Edit
              </Button>

              {isAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(task._id)}
                  disabled={isDeleting || isUpdating}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
