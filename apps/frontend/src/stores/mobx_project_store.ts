import { makeAutoObservable, runInAction } from "mobx";

export interface Project {
  id: number;
  name?: string;
  description?: string | null;
  orgId?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class ProjectStore {
  projects: Project[] = [];
  totalProjects = 0;
  hasInitialized = false;
  selectedProjectId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setProjects(projects: Project[], total: number) {
    runInAction(() => {
      this.projects = projects;
      this.totalProjects = total;
      this.hasInitialized = true;
    });
  }

  addProjects(newProjects: Project[]) {
    runInAction(() => {
      this.projects = [...this.projects, ...newProjects];
    });
  }

  selectProject(id: number | null) {
    this.selectedProjectId = id;
  }

  get selectedProject() {
    return this.projects.find((p) => p.id === this.selectedProjectId) ?? null;
  }

  get hasMoreProjects() {
    return this.projects.length < this.totalProjects;
  }

  addProjectToStore(project: Project) {
    runInAction(() => {
      this.projects.unshift(project);
      this.totalProjects += 1;
    });
  }

  updateProjectInStore(updated: Project) {
    runInAction(() => {
      this.projects = this.projects.map((p) =>
        p.id === updated.id ? { ...p, ...updated } : p
      );
    });
  }

  removeProjectFromStore(projectId: number) {
    runInAction(() => {
      this.projects = this.projects.filter((p) => p.id !== projectId);
      this.totalProjects -= 1;
    });
  }
}

export const projectStore = new ProjectStore();
