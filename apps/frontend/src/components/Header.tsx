import { useUser } from "@clerk/clerk-react";
import AddNewProject from "./project/AddNewProject";
import orgStore from "@/stores/mobx_org_store";

export const Header = () => {
  const { user } = useUser();

  const orgId : string | any = orgStore.orgId;

  return (
    <header className="p-5 flex md:flex-row flex-col gap-5 md:gap-0 items-center md:justify-between bg-gradient-to-r from-[#044ACC] to-[#57C785]">
      <div className="flex flex-col gap-1 text-white">
        <h1 className="text-3xl font-semibold">
          Welcome, {user?.firstName || user?.username || 'User'}
        </h1>
        <p className="text-sm">
          Start to create your projects and create their uis.
        </p>
      </div>
      <div>
        <AddNewProject orgId={orgId} />
      </div>
    </header>
  );
};