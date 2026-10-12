import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { AuthUser } from "../types/user";
import { api } from "../api/api";
import type { Project, User, Task, TaskStatus } from "../types/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProjectSelector from "@/components/dashboard/ProjectSelector";
import CreateTaskForm from "@/components/dashboard/CreateTaskForm";
import TaskList from "@/components/dashboard/TaskList";
import { getErrorMessage } from "@/components/dashboard/taskUtils";
import { socket } from "../socket";

type DashboardProps = {
  user: AuthUser;
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [projectError, setProjectError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [taskSuccess, setTaskSuccess] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [deletingTaskId, setDeletingTaskId] = useState("");

  const [taskRetryCount, setTaskRetryCount] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const isAdmin = user.role.toLowerCase() === "admin";

  const selectedProject = projects.find(
    (project) => project._id === selectedProjectId,
  );

  const projectUsers = users.filter((user) =>
    selectedProject?.members.includes(user._id),
  );

  async function handleReorderTasks(reorderedTasks: Task[]) {
    if (!selectedProjectId) {
      return;
    }

    const previousTasks = tasks;

    // Update the UI immediately.
    setTasks(reorderedTasks);

    try {
      const response = await api.patch(
        `/projects/${selectedProjectId}/tasks/reorder`,
        {
          taskIds: reorderedTasks.map((task) => task._id),
        },
      );

      // Use the order confirmed by the backend.
      setTasks(response.data as Task[]);
      setTaskError("");
    } catch (error) {
      // Restore the previous order if saving fails.
      setTasks(previousTasks);
      setTaskError(getErrorMessage(error, "Failed to reorder tasks."));
    }
  }

  // Load projects.
  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoadingProjects(true);
        setProjectError("");

        const response = await api.get<Project[]>("/projects");

        if (cancelled) return;

        setProjects(response.data);

        setSelectedProjectId((currentId) => {
          if (
            currentId &&
            response.data.some((project) => project._id === currentId)
          ) {
            return currentId;
          }

          return response.data[0]?._id ?? "";
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load projects:", error);
          setProjectError(
            getErrorMessage(
              error,
              "Unable to load projects. Please refresh and try again.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateProject(name: string): Promise<void> {
    try {
      setCreatingProject(true);
      setProjectError("");

      const response = await api.post<Project>("/projects", {
        name,
        members: [],
      });

      const newProject = response.data;

      setProjects((currentProjects) => [
        newProject,
        ...currentProjects.filter(
          (project) => project._id !== newProject._id,
        ),
      ]);

      setSelectedProjectId(newProject._id);
    } catch (error) {
      console.error("Failed to create project:", error);
      setProjectError(
        getErrorMessage(error, "Unable to create project."),
      );
      throw error;
    } finally {
      setCreatingProject(false);
    }
  }

  //Load users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get<{ users: User[] }>("/users");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    }

    fetchUsers();
  }, []);

  // Load tasks whenever the selected project changes.
  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      if (!selectedProjectId) {
        setTasks([]);
        setTaskError("");
        setLoadingTasks(false);
        return;
      }

      try {
        setLoadingTasks(true);
        setTaskError("");
        setTaskSuccess("");
        setTasks([]);

        const response = await api.get<Task[]>(
          `/projects/${selectedProjectId}/tasks`,
        );

        if (!cancelled) {
          setTasks(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load tasks:", error);
          setTaskError(
            getErrorMessage(error, "Unable to load tasks. Please try again."),
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTasks(false);
        }
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, taskRetryCount]);

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    socket.connect();

    socket.emit("join-project", selectedProjectId);

    const handleTaskCreated = (task: Task) => {
      setTasks((currentTasks) => {
        const alreadyExists = currentTasks.some(
          (currentTask) => currentTask._id === task._id,
        );

        if (alreadyExists) {
          return currentTasks;
        }

        return [...currentTasks, task].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      });
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks((currentTasks) =>
        currentTasks
          .map((task) => (task._id === updatedTask._id ? updatedTask : task))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
    };

    const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId),
      );
    };

    const handleTasksReordered = (reorderedTasks: Task[]) => {
      setTasks(reorderedTasks);
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);
    socket.on("tasks:reordered", handleTasksReordered);

    return () => {
      socket.emit("leave-project", selectedProjectId);

      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
      socket.off("tasks:reordered", handleTasksReordered);

      socket.disconnect();
    };
  }, [selectedProjectId]);

  // Create a task.
  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProjectId || !taskTitle.trim()) {
      setTaskError("Please enter a task title.");
      return;
    }

    try {
      setCreatingTask(true);
      setTaskError("");
      setTaskSuccess("");

      const response = await api.post<Task>(
        `/projects/${selectedProjectId}/tasks`,
        {
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          assignedTo: newAssignedTo || null,
        },
      );

      setTasks((currentTasks) =>
        [...currentTasks, response.data].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        ),
      );

      setTaskTitle("");
      setTaskDescription("");
      setTaskSuccess("Task created successfully.");
      setNewAssignedTo("");
    } catch (error) {
      console.error("Failed to create task:", error);
      setTaskError(getErrorMessage(error, "Unable to create task."));
    } finally {
      setCreatingTask(false);
    }
  }

  // Change task status.
  async function handleStatusChange(task: Task, status: TaskStatus) {
    try {
      setUpdatingTaskId(task._id);
      setTaskError("");
      setTaskSuccess("");

      const response = await api.put<Task>(`/tasks/${task._id}`, {
        status,
      });

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id ? { ...item, ...response.data, status } : item,
        ),
      );

      setTaskSuccess("Task status updated.");
    } catch (error) {
      console.error("Failed to update task status:", error);
      setTaskError(getErrorMessage(error, "Unable to update task status."));
    } finally {
      setUpdatingTaskId("");
    }
  }

  // Save task edits.
  async function handleUpdateTask(
    taskId: string,
    updates: {
      title: string;
      description: string;
      assignedTo: string | null;
    },
  ): Promise<boolean> {
    try {
      setUpdatingTaskId(taskId);
      setTaskError("");
      setTaskSuccess("");

      const response = await api.put<Task>(`/tasks/${taskId}`, updates);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId ? { ...task, ...response.data } : task,
        ),
      );

      setTaskSuccess("Task updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update task:", error);
      setTaskError(getErrorMessage(error, "Unable to update task."));
      return false;
    } finally {
      setUpdatingTaskId("");
    }
  }

  // Delete a task. The backend also enforces admin permissions.
  async function handleDeleteTask(taskId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);
      setTaskError("");
      setTaskSuccess("");

      await api.delete(`/tasks/${taskId}`);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId),
      );

      setTaskSuccess("Task deleted successfully.");
    } catch (error) {
      console.error("Failed to delete task:", error);
      setTaskError(getErrorMessage(error, "Unable to delete task."));
    } finally {
      setDeletingTaskId("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <DashboardHeader user={user} onLogout={onLogout} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard introduction */}
        <section>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user.name}. Manage your projects and tasks here.
          </p>
        </section>

        {/* Projects */}
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          selectedProject={selectedProject}
          loadingProjects={loadingProjects}
          projectError={projectError}
          isAdmin={isAdmin}
          creatingProject={creatingProject}
          onCreateProject={handleCreateProject}
          onProjectChange={setSelectedProjectId}
        />

        {/* Create task */}
        <CreateTaskForm
          selectedProjectId={selectedProjectId}
          taskTitle={taskTitle}
          taskDescription={taskDescription}
          newAssignedTo={newAssignedTo}
          projectUsers={projectUsers}
          creatingTask={creatingTask}
          onTaskTitleChange={setTaskTitle}
          onTaskDescriptionChange={setTaskDescription}
          onAssignedToChange={setNewAssignedTo}
          onSubmit={handleCreateTask}
        />

        {/* Task list */}
        <TaskList
          tasks={tasks}
          users={users}
          projectUsers={projectUsers}
          selectedProjectId={selectedProjectId}
          isAdmin={isAdmin}
          loadingTasks={loadingTasks}
          taskError={taskError}
          taskSuccess={taskSuccess}
          updatingTaskId={updatingTaskId}
          deletingTaskId={deletingTaskId}
          onRetry={() => setTaskRetryCount((count) => count + 1)}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onReorder={handleReorderTasks}
        />
      </main>
    </div>
  );
}
