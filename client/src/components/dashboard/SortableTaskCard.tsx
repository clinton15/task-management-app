
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import TaskCard from "./TaskCard";
import type { Task, TaskStatus, User } from "../../types/dashboard";

type SortableTaskCardProps = {
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

export default function SortableTaskCard({
  task,
  ...taskCardProps
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-start gap-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag task: ${task.title}`}
        title="Drag to reorder"
        className="mt-4 cursor-grab touch-none rounded-md p-2 text-slate-500 hover:bg-slate-100 active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <TaskCard task={task} {...taskCardProps} />
      </div>
    </div>
  );
}
