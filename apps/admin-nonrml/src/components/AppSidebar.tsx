"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";

// Menu items
const items = [
  { title: "Orders", url: "/orders" },
  { title: "Returns/Replacements Pending", url: "/returns" },
  { title: "Products", url: "/products" },
  { title: "Users", url: "/users" },
  { title: "Base Inventory", url: "/baseInventory" },
  { title: "Variant And Base Map", url: "/inventory" },
  { title: "Categories", url: "/category" },
  { title: "Size charts", url: "/sizeChart" },
  { title: "Payments", url: "/payments" },
  { title: "Credit Notes", url: "/creditNotes" },
  { title: "Client Home Images", url: "/homeImages" },
];

export function AppSidebar() {
  return (
    <div className="fixed inset-y-0 left-0 z-50">
      <Sidebar collapsible="offcanvas" variant="floating" className="h-full">
        <SidebarContent className="bg-white text-black shadow-lg">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center p-2 hover:bg-gray-100">
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem key={"Signout"}>
                    <SidebarMenuButton asChild>
                      <span className="cursor-pointer hover:underline text-neutral-500" onClick={()=> {signOut()}}> LOGOUT</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

export default AppSidebar;