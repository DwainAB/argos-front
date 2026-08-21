"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import {
  IconOverview,
  IconProjects,
  IconBell,
  IconSettings,
  IconLogs,
  IconIntegrations,
  IconChevronLeft,
  IconChevronRight,
} from "@/components/icons/NavIcons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => JSX.Element;
};

// Navigation en vue globale : aucun projet sélectionné.
const globalNavItems: NavItem[] = [
  { label: "Vue d'ensemble", href: "/dashboard", icon: IconOverview },
  { label: "Tous les projets", href: "/dashboard/projects", icon: IconProjects },
  { label: "Notifications", href: "/dashboard/notifications", icon: IconBell },
  { label: "Paramètres du compte", href: "/dashboard/settings", icon: IconSettings },
];

// Navigation en vue projet : contextuelle au projet sélectionné.
function getProjectNavItems(projectId: string): NavItem[] {
  const base = `/dashboard/projects/${projectId}`;
  return [
    { label: "Aperçu", href: base, icon: IconOverview },
    { label: "Logs", href: `${base}/logs`, icon: IconLogs },
    { label: "Alertes", href: `${base}/alerts`, icon: IconBell },
    { label: "Intégrations", href: `${base}/integrations`, icon: IconIntegrations },
    { label: "Paramètres du projet", href: `${base}/settings`, icon: IconSettings },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  const activeProjectId = projectMatch?.[1];

  const items = activeProjectId ? getProjectNavItems(activeProjectId) : globalNavItems;

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-surface-border/10 bg-surface-raised transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className={`flex h-14 items-center gap-2 border-b border-surface-border/10 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={toggle}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-secondary transition hover:bg-surface-border/5 hover:text-ink-primary"
            aria-label="Afficher la barre de navigation"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-500/10 text-accent-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="whitespace-nowrap text-sm font-semibold text-ink-primary">Argos AI</span>
            </Link>

            <button
              type="button"
              onClick={toggle}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-secondary transition hover:bg-surface-border/5 hover:text-ink-primary"
              aria-label="Masquer la barre de navigation"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition ${
                isActive
                  ? "bg-accent-500/10 text-accent-400"
                  : "text-ink-secondary hover:bg-surface-border/5 hover:text-ink-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
