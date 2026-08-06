import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
