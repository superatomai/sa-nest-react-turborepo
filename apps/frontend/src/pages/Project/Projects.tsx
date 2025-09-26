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
import { ProjectsLoading } from "@/components/loading-skeleton/projects-loading";
import NoProjectsFound from "@/components/project/NoProjectsFound";
import AddNewProject from "@/components/project/AddNewProject";

const LIMIT = 8;

const Projects = () => {
	const { organization } = useOrganization();
	const orgId: string | undefined = organization?.id;
	const [page, setPage] = useState(0);

	if (!orgId) {
		return <div>No organization selected</div>;
	}

	const  projectsQuery: any = trpc.projectsGetAll.useQuery(
		{ orgId, skip: page * LIMIT, limit: LIMIT },
		{
			...(undefined as any),
			keepPreviousData: true,
		}
	);

	const isProjectsActive = window.location.pathname === "/projects";
	const projectList = projectStore.projects;
	const selectedId = projectStore.selectedProjectId;
	const selectedProject = projectList.find((p) => p.id === selectedId);

	// Fix the loading logic - only show full loading screen for initial load
	const isInitialLoading = projectsQuery.isLoading && !projectStore.hasInitialized && page === 0;
	const isLoadingMore = projectsQuery.isFetching && page > 0;
	const hasNoProjects = projectStore.projects.length === 0 && projectStore.hasInitialized && !projectsQuery.isLoading;

	// Clear selected project when navigating to /projects page
	useEffect(() => {
		projectStore.selectProject(undefined);
	}, []);

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

	// Scroll to selected project
	useEffect(() => {
		const el = document.getElementById("selected-project-container");
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [selectedId]);

	const handleProjectSelect = (projectId: number) => {
		projectStore.selectProject(projectId);
	};

	const handleLoadMore = () => {
		if (projectStore.hasMoreProjects) {
			setPage((prev) => prev + 1);
		}
	};

	// Show loading screen only for initial load
	if (isInitialLoading) {
		return (
			<div className="w-full min-h-screen">
				<ProjectsLoading />
			</div>
		);
	}

	if(projectsQuery.error){
		return <div className="m-4 text-red-600">Error loading projects: {projectsQuery.error.message}</div>
	}

	// Show projects page with consistent header
	return (
		<div className="">
			<Header />
			<div className="mx-4">
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
							<div className="flex items-center gap-3">
								<h1 className="text-2xl font-semibold text-gray-900 leading-none">
									<span className="text-blue-600 font-bold">{projectStore.totalProjects}</span> {projectStore.totalProjects === 1 ? 'Project' : 'Projects'}
								</h1>
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

			{/* Conditional Content: No Projects Found vs Projects Grid */}
			{hasNoProjects ? (
				<div className="mx-4 flex-1 flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
					<NoProjectsFound orgId={orgId} />
				</div>
			) : (
				<>
					{/* Projects Grid */}
					<div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mx-4">
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
						<div className="flex justify-center mt-6 mb-5">
							<button
								onClick={handleLoadMore}
								disabled={isLoadingMore}
								className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
							>
								{isLoadingMore ? (
									<div className="flex items-center gap-2">
										<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
										Loading...
									</div>
								) : (
									"Load More"
								)}
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
				</>
			)}
		</div>
	);
};

export default observer(Projects);