import { makeAutoObservable, runInAction } from "mobx";

export interface Project {
  uis_count: number;
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
  selectedProjectId: number | undefined;

  // Pagination state
  skip = 0;
  limit = 8;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Replace projects completely (first page).
   */
  setProjects(projects: Project[], total: number) {
    runInAction(() => {
      this.projects = projects;
      this.totalProjects = Number(total);
      this.hasInitialized = true;
      this.skip = projects.length; // move skip forward
    });
  }

  /**
   * Append more projects (load more).
   */
  addProjects(projects: Project[], total: number) {
    runInAction(() => {
      this.projects = [...this.projects, ...projects];
      this.totalProjects = total;
      this.skip += projects.length;
    });
  }

  /**
   * Reset store completely (useful when org changes).
   */
  resetPagination() {
    runInAction(() => {
      this.projects = [];
      this.totalProjects = 0;
      this.skip = 0;
      this.hasInitialized = false;
      this.selectedProjectId = undefined;
    });
  }

  selectProject(id: number | undefined) {
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
      this.selectedProjectId = project.id;
    });
  }

  updateProjectInStore(updated: Project) {
    console.log("updateProjectInStore", updated);
    runInAction(() => {
      this.projects = this.projects.map((p) =>
        p.id === updated.id ? { ...p, ...updated } : p
      );
      this.sortProjectsInStore();
    });
  }

  sortProjectsInStore(){
    console.log("sorting projects by updated at desc")

    this.projects = this.projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0);
      const dateB = new Date(b.updatedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  increaseUiCount(projectId : number){
    runInAction(() => {
      this.projects = this.projects.map((p) =>
        p.id === projectId ? { ...p,  uis_count: Number(p.uis_count) + 1, updatedAt: new Date().toISOString() } : p
      );
      this.sortProjectsInStore();
    });
  }

  decreaseUiCount(projecId : number){
    runInAction(() => {
      this.projects = this.projects.map((p) =>
        p.id === projecId ? { ...p, uis_count: p.uis_count - 1, updatedAt: new Date().toISOString() } : p
      );
      this.sortProjectsInStore();
    });
  }

  removeProjectFromStore(projectId: number) {
    runInAction(() => {
      this.projects = this.projects.filter((p) => p.id !== projectId);
      this.totalProjects -= 1;
      this.selectedProjectId = undefined;
    });
  }
}

export const projectStore = new ProjectStore();
