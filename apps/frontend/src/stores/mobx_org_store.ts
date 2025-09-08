import { makeAutoObservable } from "mobx";

class OrgStore {
  orgId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setOrgId(orgId: string | null) {
    this.orgId = orgId;
  }

  reset() {
    this.orgId = null;
  }
}

const orgStore = new OrgStore();
export default orgStore;
