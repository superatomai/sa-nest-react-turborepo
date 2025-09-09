import { 
  SignedIn, 
  UserButton, 
  SignOutButton, 
  OrganizationSwitcher
} from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
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

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: "lucide:home"
  },
//   {
//     title: "Editor",
//     url: "/editor", 
//     icon: "lucide:edit"
//   },
  {
    title: "Projects",
    url: "/projects",
    icon: "lucide:folder"
  }
];

export function AppSidebar() {
  const location = useLocation();
  const sidebar = useSidebar();

  return (
    <SignedIn>
      <Sidebar collapsible="icon" className="h-screen bg-white outline-2 static w-[200px] pt-5" variant="inset">
        <SidebarHeader className="flex w-full items-center justify-center p-0">
          <div className="flex w-full justify-between px-2">
            {sidebar.open ? <h2 className="text-[20px] tracking-tight font-bold bg-gradient-to-r from-[#044ACC] to-[#57C785] bg-clip-text text-transparent">
  Superatom Ai
</h2>
 : null}
            <SidebarTrigger className="-mr-1 z-50 cursor-pointer" />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            {sidebar.open && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            {sidebar.open && <SidebarGroupLabel>Organization</SidebarGroupLabel>}
            <SidebarGroupContent>
              {sidebar.open ? (
                <div className="px-2 py-1">
                  <OrganizationSwitcher 
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        organizationSwitcherTrigger: "w-full justify-start text-sm"
                      }
                    }}
                  />
                </div>
              ) : (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Organization"
                      className="justify-center"
                    >
                      <Icon icon="lucide:building" className="h-4 w-4" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
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
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                  <SignOutButton redirectUrl="/login">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Icon 
                        icon="lucide:log-out" 
                        className="h-4 w-4" 
                      />
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
                          avatarBox: "w-6 h-6"
                        }
                      }}
                    />
                  </SidebarMenuButton>
                  <SignOutButton redirectUrl="/login">
                    <SidebarMenuButton
                      tooltip="Sign Out"
                      className="justify-center w-8 h-8 p-0 cursor-pointer"
                      asChild
                    >
                      <Button variant="ghost" size="sm" className="cursor-pointer">
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
}