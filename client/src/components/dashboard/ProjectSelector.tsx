import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Project, User } from "../../types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProjectSelectorProps = {
  projects: Project[];
  selectedProjectId: string;
  selectedProject?: Project;
  loadingProjects: boolean;
  projectError: string;
  isAdmin: boolean;
  creatingProject: boolean;
  onCreateProject: (name: string) => Promise<void>;
  onProjectChange: (projectId: string) => void;
  users: User[];
  savingMembers: boolean;
  memberError: string;
  memberSuccess: string;
  onSaveMembers: (memberIds: string[]) => Promise<void>;
};

const ProjectSelector = ({
  projects,
  selectedProjectId,
  selectedProject,
  loadingProjects,
  projectError,
  isAdmin,
  creatingProject,
  onCreateProject,
  onProjectChange,
  users,
  savingMembers,
  memberError,
  memberSuccess,
  onSaveMembers,
}: ProjectSelectorProps) => {
  const [projectName, setProjectName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    selectedProject?.members ?? []
  );

  useEffect(() => {
    setSelectedMemberIds(selectedProject?.members ?? []);
  }, [selectedProjectId, selectedProject]);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = projectName.trim();
    if (!name) return;

    await onCreateProject(name);
    setProjectName("");
  }

  async function handleSaveMembers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSaveMembers(selectedMemberIds);
  }

  function toggleMember(userId: string, checked: boolean) {
    setSelectedMemberIds((current) =>
      checked
        ? current.includes(userId)
          ? current
          : [...current, userId]
        : current.filter((id) => id !== userId)
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAdmin && (
          <form onSubmit={handleCreateProject} className="flex gap-2">
            <Input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="New project name"
              required
              disabled={creatingProject}
            />
            <Button type="submit" disabled={creatingProject}>
              {creatingProject ? "Creating..." : "Create"}
            </Button>
          </form>
        )}

        <p className="text-sm text-slate-500">
          Select a project to view and manage its tasks.
        </p>

        {loadingProjects ? (
          <p>Loading projects...</p>
        ) : projectError ? (
          <p role="alert" className="text-sm text-red-600">
            {projectError}
          </p>
        ) : projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <select
            value={selectedProjectId}
            onChange={(event) => onProjectChange(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-background px-3 py-2 text-sm"
          >
            <option value="">Choose a project...</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        )}

        {selectedProject && (
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm">
              Selected project: <strong>{selectedProject.name}</strong>
            </p>

            <p className="text-sm text-slate-500">
              {selectedProject.members.length} member(s)
            </p>

            {isAdmin && (
              <form onSubmit={handleSaveMembers} className="space-y-3">
                <p className="text-sm font-medium">Manage project members</p>

                {users.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No users available.
                  </p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {users.map((user) => (
                      <label
                        key={user._id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(user._id)}
                          onChange={(event) =>
                            toggleMember(user._id, event.target.checked)
                          }
                        />
                        <span>{user.name || user.email || user._id}</span>
                        {user.email && (
                          <span className="text-xs text-slate-500">
                            ({user.email})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {memberError && (
                  <p role="alert" className="text-sm text-red-600">
                    {memberError}
                  </p>
                )}

                {memberSuccess && (
                  <p className="text-sm text-green-600">{memberSuccess}</p>
                )}

                <Button
                  type="submit"
                  disabled={savingMembers}
                  className="w-full"
                >
                  {savingMembers ? "Saving..." : "Save Members"}
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSelector;
