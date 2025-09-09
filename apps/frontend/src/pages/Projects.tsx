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
import CardsLoading from "@/components/loading-skeleton/cards-loading";
import { ProjectsLoading } from "@/components/loading-skeleton/projects-loading";

const LIMIT = 8;

const Projects = () => {
  const { organization } = useOrganization();
  const orgId: string | undefined = organization?.id;
  const [selectedId, setSelectedId] = useState<number>();
  const [page, setPage] = useState(0);

  if (!orgId) {
    return <div>No organization selected</div>;
  }

  const projectsQuery = trpc.projectsGetAll.useQuery(
    { orgId, skip: page * LIMIT, limit: LIMIT },
    {
      ...(undefined as any),
      keepPreviousData: true,
    }
  );

  const isProjectsActive = window.location.pathname === "/projects";
  const projectList = projectStore.projects;
  const selectedProject = projectList.find((p) => p.id === selectedId);
  const projectsLoading = projectStore.hasInitialized;  

  useEffect(() => {
    if (projectsQuery.data?.projects) {
      if (page === 0) {
        projectStore.setProjects(
          projectsQuery.data.projects,
          projectsQuery.data.totalCount
        );
      } else {
        projectStore.addProjects(
          projectsQuery.data.projects,
          projectsQuery.data.totalCount
        );
      }
    }
  }, [projectsQuery.data, page]);


  useEffect(()=>{
    console.log(JSON.stringify(projectList))
},[projectList])

  // Scroll to selected project
  useEffect(() => {
    const el = document.getElementById("selected-project-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedId]);

  const handleProjectSelect = (projectId: number) => {
    setSelectedId(projectId);
    projectStore.selectProject(projectId);
  };

  const handleLoadMore = () => {
    if (projectStore.hasMoreProjects) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <>
    {
      !projectsLoading ? (
      <>
        <ProjectsLoading/>
      </> )
      : 
      (<div className="container mx-auto">
      <Header />
      <div className="">
        <div className="flex flex-col gap-3 w-full">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1 text-sm text-gray-600 my-4">
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

      {/* Projects Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 ">
        {projectList.map((project) => (
          <ProjectCard
            key={project.id}
            ProjectDetails={project}
            selected={selectedId === project.id}
            onSelect={() => handleProjectSelect(project.id)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {projectStore.hasMoreProjects && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={projectsQuery.isFetching}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {projectsQuery.isFetching ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Selected Project UIs */}
      {selectedProject && selectedId && (
        <div
          className="flex w-full flex-col gap-4"
          id="selected-project-container"
        >
          <AllUis projectId={selectedId} selectedProject={selectedProject} />
        </div>
      )}
    </div>)
    }
    
    
   
    </>

  );
};

export default observer(Projects);
