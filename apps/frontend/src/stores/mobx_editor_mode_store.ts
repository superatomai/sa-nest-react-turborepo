import { makeAutoObservable } from "mobx";

export type EditorMode = 'dev' | 'preview';

class EditorModeStore {
  currentMode: EditorMode = 'dev';

  constructor() {
    makeAutoObservable(this);
  }

  setMode(mode: EditorMode) {
    this.currentMode = mode;
  }

  toggleMode() {
    this.currentMode = this.currentMode === 'dev' ? 'preview' : 'dev';
  }

  get isDev() {
    return this.currentMode === 'dev';
  }

  get isPreview() {
    return this.currentMode === 'preview';
  }
}

export const editorModeStore = new EditorModeStore();