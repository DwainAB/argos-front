"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { API_URL } from "@/lib/config";
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
  badge?: number;
};

const POLL_INTERVAL_MS = 5000;

// Navigation en vue globale : aucun projet sélectionné.
const globalNavItems: NavItem[] = [
  { label: "Vue d'ensemble", href: "/dashboard", icon: IconOverview },
  { label: "Tous les projets", href: "/dashboard/projects", icon: IconProjects },
  { label: "Notifications", href: "/dashboard/notifications", icon: IconBell },
  { label: "Paramètres du compte", href: "/dashboard/settings", icon: IconSettings },
];

// Navigation en vue projet : contextuelle au projet sélectionné.
function getProjectNavItems(projectId: string, alertsCount: number): NavItem[] {
  const base = `/dashboard/projects/${projectId}`;
  return [
    { label: "Aperçu", href: base, icon: IconOverview },
    { label: "Logs", href: `${base}/logs`, icon: IconLogs },
    { label: "Alertes", href: `${base}/alerts`, icon: IconBell, badge: alertsCount },
    { label: "Intégrations", href: `${base}/integrations`, icon: IconIntegrations },
    { label: "Paramètres du projet", href: `${base}/settings`, icon: IconSettings },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  const projectMatch = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  const activeProjectId = projectMatch?.[1];

  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    if (!activeProjectId) return;

    let cancelled = false;

    async function fetchAlertsCount() {
      try {
        const res = await fetch(`${API_URL}/api/projects/${activeProjectId}/alerts`);
        const data = await res.json();
        if (cancelled) return;
        const alerts: unknown[] = data.alerts ?? [];
        setAlertsCount(alerts.length);
      } catch (err) {
        console.error("Erreur lors du chargement du nombre d'alertes :", err);
      }
    }

    fetchAlertsCount();
    const interval = setInterval(fetchAlertsCount, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeProjectId]);

  const items = activeProjectId ? getProjectNavItems(activeProjectId, alertsCount) : globalNavItems;

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
              <span className="whitespace-nowrap text-sm font-semibold text-ink-primary">Guardian AI</span>
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
          const hasBadge = !!item.badge;
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
              <span className="relative flex shrink-0">
                <Icon className="h-4 w-4" />
                {collapsed && hasBadge && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-status-critical text-[9px] font-medium leading-none text-white">
                    {item.badge! > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span className="flex flex-1 items-center justify-between gap-2">
                  <span className="whitespace-nowrap">{item.label}</span>
                  {hasBadge && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-status-critical px-1.5 text-[11px] font-medium leading-none text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
