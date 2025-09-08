import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import ProjectCard from "@/components/project/ProjectCard";
import { projectStore } from "@/stores/mobx_project_store";
import { trpc } from "@/utils"; // React hooks version
import { useOrganization } from "@clerk/clerk-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ToggleListGrid } from "@/components/ToggleListGrid";
import { Header } from "@/components/Header";
import AllUis from "@/components/uis/AllUis";

const Projects = () => {
  const { organization } = useOrganization();
  const orgId: string | any = organization?.id;
  const [selectedId, setSelectedId] = useState<number>();
  

  if (!orgId) {
    return <div>No organization selected</div>;
  }

  const projectsQuery = trpc.projectsGetAll.useQuery({ orgId });
  const isProjectsActive = window.location.pathname === "/projects";
  const Projects = projectStore.projects;
  const selectedProject: any = Projects.find((p: any) => p.id === selectedId)

  useEffect(() => {
    if (projectsQuery.data?.projects) {
      projectStore.setProjects(
        projectsQuery.data.projects,
        projectsQuery.data.totalCount
      );
    }
  }, [projectsQuery.data]);


  useEffect(() => {
        const el = document.getElementById("selected-project-container");
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [selectedId]);


  const handleProjectSelect = (projectId: number) => {
    setSelectedId(projectId);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <Header/>
      <div className="">
        <div className="flex flex-col gap-3 w-full">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
            <Icon icon={"si:projects-line"} width={14} height={14} />
            <span
              className={`${isProjectsActive ? "text-blue-600" : ""} font-xs`}
            >
              Projects
            </span>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-5">
              <div className="flex items-center relative">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Your Projects
                </h1>
                <span className="bg-gray-100 text-blue-700 px-2 rounded-md text-sm font-medium absolute -right-7 -top-1">
                  {projectStore.totalProjects}
                </span>
              </div>
              <ToggleListGrid />
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
                <Icon icon="material-symbols:archive-rounded" />
                <span className="text-sm font-medium">Archived</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
                <Icon icon="line-md:filter-filled" />
                <span className="text-sm font-medium">Show Filters</span>
              </button>
              <div className="relative flex items-center w-64 rounded-lg border border-gray-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                <Icon
                  icon="material-symbols:search-rounded"
                  className="ml-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-transparent py-2 pl-2 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 ">
        {Projects.map((project) => (
          <ProjectCard
            key={project.id}
            ProjectDetails={project}
            selected={selectedId === project.id}
            onSelect={() => handleProjectSelect(project.id)}
          />
        ))}
      </div>

      {selectedProject && selectedId && (
                <div
                    className="flex w-full flex-col gap-4"
                    id="selected-project-container"
                >
                    <AllUis projectId={selectedId} selectedProject={selectedProject}/>
                </div>
        )}
    </div>
  );
};

export default observer(Projects);
