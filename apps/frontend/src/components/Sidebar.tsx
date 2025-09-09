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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: "lucide:home"
  },
  {
    title: "Editor",
    url: "/editor", 
    icon: "lucide:edit"
  },
  {
    title: "Projects",
    url: "/projects",
    icon: "lucide:folder"
  }
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <SignedIn>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Your App
            </h2>
            <SidebarTrigger className="-mr-1" />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
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
            <SidebarGroupLabel>Organization</SidebarGroupLabel>
            <SidebarGroupContent>
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
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SignedIn>
  );
}