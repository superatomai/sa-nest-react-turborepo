import { makeAutoObservable, runInAction } from "mobx";
import { projectStore } from "./mobx_project_store";

export interface Ui {
  id: number;
  name?: string;
  description?: string | null;
  projectId: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class UisStore {
  uis: Ui[] = [];
  hasInitialized = false;
  selectedUiId: number | null = null;
  totalUis: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setUis(uis: Ui[]) {
    runInAction(() => {
      this.uis = uis;
      this.hasInitialized = true;
    });
  }

  addUis(newUis: Ui[]) {
    runInAction(() => {
      this.uis = [...this.uis, ...newUis];
    });
  }

  selectUi(id: number | null) {
    this.selectedUiId = id;
  }

  get selectedUi() {
    return this.uis.find((u) => u.id === this.selectedUiId) ?? null;
  }

//   get hasMoreUis() {
//     return this.uis.length < this.totalUis;
//   }

  addUiToStore(ui: Ui) {
    runInAction(() => {
      projectStore.increaseUiCount(ui.projectId);
      this.uis.unshift(ui);
      this.totalUis += 1;
    });
  }

  updateUiInStore(updated: Ui) {
    runInAction(() => {
      this.uis = this.uis.map((u) =>
        u.id === updated.id ? { ...u, ...updated } : u
      );
    });
  }

  removeUiFromStore(id: number, projectId: number) {
    runInAction(() => {
      projectStore.decreaseUiCount(projectId);
      this.uis = this.uis.filter((u) => u.id !== id);
      this.totalUis -= 1;
    });
  }
}

export const uisStore = new UisStore();
