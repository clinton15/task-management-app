
import { useState } from "react";
import type { FormEvent } from "react";
import type { Project } from "../../types/dashboard";
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
}: ProjectSelectorProps) => {
  const [projectName, setProjectName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = projectName.trim();

    if (!name) return;

    await onCreateProject(name);
    setProjectName("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          Select a project to view and manage its tasks.
        </p>

        {loadingProjects ? (
          <p className="text-sm text-slate-500">Loading projects...</p>
        ) : projectError ? (
          <p role="alert" className="text-sm text-red-600">{projectError}</p>
        ) : (
          <select
            value={selectedProjectId}
            onChange={(event) => onProjectChange(event.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm sm:max-w-md"
            aria-label="Select project"
          >
            <option value="">Choose a project...</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        )}

        {isAdmin && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="New project name"
              aria-label="New project name"
              maxLength={100}
              required
            />
            <Button type="submit" disabled={creatingProject || !projectName.trim()}>
              {creatingProject ? "Creating..." : "Create Project"}
            </Button>
          </form>
        )}

        {selectedProject && (
          <div className="rounded-md bg-slate-100 p-3">
            <p className="text-sm text-slate-600">
              Selected project: <strong>{selectedProject.name}</strong>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedProject.members.length} member
              {selectedProject.members.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSelector;
