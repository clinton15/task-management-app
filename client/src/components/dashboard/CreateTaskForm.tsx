import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "../../types/dashboard";

type CreateTaskFormProps = {
  selectedProjectId: string;
  taskTitle: string;
  taskDescription: string;
  newAssignedTo: string;
  projectUsers: User[];
  creatingTask: boolean;

  onTaskTitleChange: (value: string) => void;
  onTaskDescriptionChange: (value: string) => void;
  onAssignedToChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const CreateTaskForm = ({
  selectedProjectId,
  taskTitle,
  taskDescription,
  newAssignedTo,
  projectUsers,
  creatingTask,
  onTaskTitleChange,
  onTaskDescriptionChange,
  onAssignedToChange,
  onSubmit,
}: CreateTaskFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Task</CardTitle>
      </CardHeader>

      <CardContent>
        {!selectedProjectId ? (
          <p className="text-sm text-slate-500">
            Select a project before creating a task.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-medium">
                Task title
              </label>

              <input
                id="task-title"
                value={taskTitle}
                onChange={(event) => onTaskTitleChange(event.target.value)}
                placeholder="Enter task title"
                required
                maxLength={200}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="task-assignee" className="text-sm font-medium">
                Assign to
              </label>

              <select
                id="task-assignee"
                value={newAssignedTo}
                onChange={(event) =>
                  onAssignedToChange(event.target.value)
                }
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>

                {projectUsers.map((projectUser) => (
                  <option key={projectUser._id} value={projectUser._id}>
                    {projectUser.name} ({projectUser.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="task-description"
                className="text-sm font-medium"
              >
                Description (optional)
              </label>

              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(event) =>
                  onTaskDescriptionChange(event.target.value)
                }
                placeholder="Describe the task"
                rows={3}
                maxLength={2000}
                className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <Button type="submit" disabled={creatingTask}>
              {creatingTask ? "Creating..." : "Create Task"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateTaskForm;
