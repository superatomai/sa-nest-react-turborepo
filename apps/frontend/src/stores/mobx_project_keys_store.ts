import { makeAutoObservable, runInAction } from "mobx";

export interface ProjectKey {
  id: number;
  name: string;
  keyValue: string;
  environment: string;
  customInst?: string | null;
  isActive: boolean;
  deleted: boolean;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

class ProjectKeysStore {
  projectKeys: ProjectKey[] = [];
  hasInitialized = false;
  selectedKeyId: number | null = null;
  totalKeys: number = 0;
  currentProjectId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Set project keys for a specific project
   */
  setProjectKeys(keys: ProjectKey[], projectId: number) {
    runInAction(() => {
      this.projectKeys = keys;
      this.hasInitialized = true;
      this.currentProjectId = projectId;
      this.totalKeys = keys.length;
    });
  }

  /**
   * Add more project keys (for pagination if needed)
   */
  addProjectKeys(keys: ProjectKey[]) {
    runInAction(() => {
      this.projectKeys = [...this.projectKeys, ...keys];
      this.totalKeys += keys.length;
    });
  }

  /**
   * Reset store when switching projects
   */
  resetStore() {
    runInAction(() => {
      this.projectKeys = [];
      this.hasInitialized = false;
      this.selectedKeyId = null;
      this.totalKeys = 0;
      this.currentProjectId = null;
    });
  }

  /**
   * Select a project key
   */
  selectKey(id: number | null) {
    this.selectedKeyId = id;
  }

  get selectedKey() {
    return this.projectKeys.find((key) => key.id === this.selectedKeyId) ?? null;
  }

  /**
   * Add new project key to store
   */
  addKeyToStore(key: ProjectKey) {
    runInAction(() => {
      this.projectKeys.unshift(key);
      this.totalKeys += 1;
      this.selectedKeyId = key.id;
      this.sortKeysInStore();
    });
  }

  /**
   * Update existing project key in store
   */
  updateKeyInStore(updated: ProjectKey) {
    runInAction(() => {
      this.projectKeys = this.projectKeys.map((key) =>
        key.id === updated.id ? { ...key, ...updated } : key
      );
      this.sortKeysInStore();
    });
  }

  /**
   * Sort keys by updated date (newest first)
   */
  sortKeysInStore() {
    console.log("sorting project keys by updated at desc")

    this.projectKeys = this.projectKeys.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0);
      const dateB = new Date(b.updatedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Remove project key from store (soft delete)
   */
  removeKeyFromStore(keyId: number) {
    runInAction(() => {
      this.projectKeys = this.projectKeys.filter((key) => key.id !== keyId);
      this.totalKeys -= 1;
      if (this.selectedKeyId === keyId) {
        this.selectedKeyId = null;
      }
    });
  }

  /**
   * Toggle key active status
   */
  toggleKeyStatus(keyId: number) {
    runInAction(() => {
      this.projectKeys = this.projectKeys.map((key) =>
        key.id === keyId ? { ...key, isActive: !key.isActive } : key
      );
    });
  }

  /**
   * Get keys by environment
   */
  getKeysByEnvironment(environment: string) {
    return this.projectKeys.filter((key) => key.environment === environment);
  }

  /**
   * Get active keys only
   */
  get activeKeys() {
    return this.projectKeys.filter((key) => key.isActive);
  }
}

export const projectKeysStore = new ProjectKeysStore();