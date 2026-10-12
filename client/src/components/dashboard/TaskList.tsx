import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableTaskCard from "./SortableTaskCard";
import type { Task, TaskStatus, User } from "../../types/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TaskListProps = {
  tasks: Task[];
  users: User[];
  projectUsers: User[];
  selectedProjectId: string;
  isAdmin: boolean;
  loadingTasks: boolean;
  taskError: string;
  taskSuccess: string;
  updatingTaskId: string;
  deletingTaskId: string;
  onRetry: () => void;
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
  onReorder: (reorderedTasks: Task[]) => void;
};

export default function TaskList({
  tasks,
  users,
  projectUsers,
  selectedProjectId,
  isAdmin,
  loadingTasks,
  taskError,
  taskSuccess,
  updatingTaskId,
  deletingTaskId,
  onRetry,
  onStatusChange,
  onUpdate,
  onDelete,
  onReorder,
}: TaskListProps) {
  const showLoadError = Boolean(
    taskError && tasks.length === 0 && !loadingTasks,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex(
      (task) => task._id === active.id,
    );

    const newIndex = tasks.findIndex(
      (task) => task._id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedTasks = arrayMove(
      tasks,
      oldIndex,
      newIndex,
    ).map((task, index) => ({
      ...task,
      order: index,
    }));

    onReorder(reorderedTasks);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Tasks</CardTitle>

          {selectedProjectId && (
            <Badge variant="secondary">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {taskError && !showLoadError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-600"
          >
            {taskError}
          </p>
        )}

        {taskSuccess && (
          <p
            role="status"
            className="rounded-md bg-green-50 p-3 text-sm text-green-700"
          >
            {taskSuccess}
          </p>
        )}

        {!selectedProjectId ? (
          <div className="rounded-lg border border-dashed bg-white px-4 py-12 text-center">
            <h3 className="font-medium">No project selected</h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose a project above to view its tasks.
            </p>
          </div>
        ) : loadingTasks ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading tasks...
          </p>
        ) : showLoadError ? (
          <div className="py-6 text-center">
            <p role="alert" className="text-sm text-red-600">
              {taskError}
            </p>

            <Button
              className="mt-3"
              variant="outline"
              onClick={onRetry}
            >
              Retry loading tasks
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-white px-4 py-12 text-center">
            <h3 className="font-medium">No tasks yet</h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first task using the form above.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tasks.map((task) => (
                  <SortableTaskCard
                    key={task._id}
                    task={task}
                    users={users}
                    projectUsers={projectUsers}
                    isAdmin={isAdmin}
                    updatingTaskId={updatingTaskId}
                    deletingTaskId={deletingTaskId}
                    onStatusChange={onStatusChange}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
