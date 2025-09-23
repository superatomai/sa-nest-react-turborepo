import {
  SignedIn,
  UserButton,
  SignOutButton,
  OrganizationSwitcher,
} from "@clerk/clerk-react";
import { Link, useLocation, useMatch, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { projectStore } from "@/stores/mobx_project_store";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DatabaseUtils from "../utils/database";
import orgStore from "@/stores/mobx_org_store";
import { truncateText } from "../lib/utils/index";

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: "lucide:home",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: "lucide:folder",
    children: [
      {
        title: "Logs",
        url: "/project-logs",
        icon: "lucide:logs",
      },
      {
        title: "Design System",
        url: "/design-system",
        icon: "mdi:color",
      },
      {
        title: "Documentation",
        url: "/documentation",
        icon: "oui:documentation",
      },
      {
        title: "API Keys",
        url: "/api-keys",
        icon: "iconoir:key",
      },
    ],
  },
];

const AppSidebar = () => {
  const location = useLocation();
  const sidebar = useSidebar();
  const match = useMatch("/projects/:projectId/*");

  const projectId = match?.params.projectId || projectStore.selectedProjectId || null;
  const { data: project, isLoading: projectLoading, error } = DatabaseUtils.useGetProjectById(
      projectId ? Number(projectId) : null,
      orgStore.orgId || ''
    );

  

  return (
    <SignedIn>
      <Sidebar
        collapsible="icon"
        className="h-screen bg-white border-r-2 border-gray-200 static w-[200px] pt-5"
        variant="inset"
      >
        <SidebarHeader className="flex w-full items-center justify-center p-0">
          <div className="flex w-full justify-between px-2">
            {sidebar.open ? (
              <h2 className="text-[20px] tracking-tight font-bold bg-gradient-to-r from-[#044ACC] to-[#57C785] bg-clip-text text-transparent">
                Superatom Ai
              </h2>
            ) : null}
            <SidebarTrigger className="-mr-1 z-50 cursor-pointer" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {sidebar.open && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item, i) => {
                  const hasChildren = item.children && projectId && sidebar.open;

                  if (hasChildren) {
                    return (
                      <SidebarMenuItem key={i}>
                        <Collapsible defaultOpen>
                          <div className="relative flex items-center">
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === item.url}
                              tooltip={!sidebar.open ? item.title : undefined}
                              className={!sidebar.open ? "justify-center" : "flex-1"}
                            >
                              <Link to={item.url}>
                                <Icon icon={item.icon} className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                            {sidebar.open && (
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-transparent cursor-pointer group"
                                >
                                  <Icon
                                    icon="lucide:chevron-down"
                                    className="h-3 w-3 transition-transform duration-200 group-data-[state=closed]:-rotate-90 cursor-pointer"
                                  />
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </div>
                          <CollapsibleContent>
                            <div className="mt-2">
                              <div className="px-3 mb-1">
                                <span className="text-xs font-medium text-muted-foreground ">
                                  Project ({truncateText(project?.project?.name, 12)  || ""})
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {item.children.map((child, childIndex) => (
                                  <li key={`${i}-${childIndex}`}>
                                    <SidebarMenuButton
                                      asChild
                                      isActive={location.pathname === `/projects/${projectId}${child.url}`}
                                      className="pl-6"
                                    >
                                      <Link to={`/projects/${projectId}${child.url}`}>
                                        <Icon icon={child.icon} className="h-3.5 w-3.5" />
                                        <span>{child.title}</span>
                                      </Link>
                                    </SidebarMenuButton>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={!sidebar.open ? item.title : undefined}
                        className={!sidebar.open ? "justify-center" : ""}
                      >
                        <Link to={item.url}>
                          <Icon icon={item.icon} className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {sidebar.open && (
              <SidebarGroupLabel>Organization</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              {sidebar.open ? (
                <div className="px-2 py-1">
                  <OrganizationSwitcher
                    createOrganizationMode="modal"
                    afterLeaveOrganizationUrl="/create-organization"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        organizationSwitcherTrigger:
                          "w-full justify-start text-sm",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex justify-center px-2 relative">
                  <OrganizationSwitcher
                    createOrganizationMode="modal"
                    afterLeaveOrganizationUrl="/create-organization"
                    appearance={{
                      elements: {
                        rootBox: "",
                        organizationSwitcherTrigger:
                          "w-8 h-8 p-0 rounded-md hover:bg-accent [&>span]:hidden [&>div]:hidden",
                        organizationSwitcherTriggerIcon: "hidden",
                      },
                    }}
                  />
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu className="flex items-center justify-between w-full">
            <SidebarMenuItem className="flex w-full items-center justify-between">
              {sidebar.open ? (
                <div className="flex items-center justify-between w-full px-2 py-1">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                  <SignOutButton redirectUrl="/login">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Icon icon="lucide:log-out" className="h-4 w-4" />
                    </Button>
                  </SignOutButton>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <SidebarMenuButton
                    tooltip="Profile"
                    className="justify-center w-8 h-8 p-0"
                  >
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-6 h-6",
                        },
                      }}
                    />
                  </SidebarMenuButton>
                  <SignOutButton redirectUrl="/login">
                    <SidebarMenuButton
                      tooltip="Sign Out"
                      className="justify-center w-8 h-8 p-0 cursor-pointer"
                      asChild
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Icon
                          icon="lucide:log-out"
                          className="h-4 w-4 cursor-pointer"
                        />
                      </Button>
                    </SidebarMenuButton>
                  </SignOutButton>
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SignedIn>
  );
};

export default observer(AppSidebar);
