import { makeAutoObservable } from "mobx";

class OrgStore {
  orgId: string | null = null;

  constructor() {
    makeAutoObservable(this);
    // Restore from localStorage on app start
    const saved = localStorage.getItem('currentOrgId');
    if (saved) this.orgId = saved;
  }

  setOrgId(orgId: string | null) {
    this.orgId = orgId;
    if (orgId) {
      localStorage.setItem('currentOrgId', orgId);
    } else {
      localStorage.removeItem('currentOrgId');
    }
  }

  reset() {
    this.orgId = null;
    localStorage.removeItem('currentOrgId');
  }
}

const orgStore = new OrgStore();
export default orgStore;
