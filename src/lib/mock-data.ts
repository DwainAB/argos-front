// Données factices utilisées pour construire l'interface avant le branchement au backend.

export type ProjectStatus = "good" | "warning" | "critical";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  githubRepo: string;
  githubBranch: string;
  lastDeployAt: string;
};

export const mockProjects: Project[] = [
  {
    id: "guardian-api",
    name: "Guardian API",
    status: "good",
    githubRepo: "DwainAB/guardian-back",
    githubBranch: "main",
    lastDeployAt: "Il y a 12 minutes",
  },
  {
    id: "guardian-front",
    name: "Guardian Front",
    status: "warning",
    githubRepo: "DwainAB/guardian-front",
    githubBranch: "main",
    lastDeployAt: "Il y a 1 heure",
  },
  {
    id: "billing-service",
    name: "Billing Service",
    status: "critical",
    githubRepo: "DwainAB/billing-service",
    githubBranch: "develop",
    lastDeployAt: "Il y a 3 heures",
  },
];

export type NotificationItem = {
  id: string;
  projectId: string;
  projectName: string;
  level: "info" | "warning" | "error";
  message: string;
  time: string;
};

export const mockNotifications: NotificationItem[] = [
  {
    id: "n1",
    projectId: "billing-service",
    projectName: "Billing Service",
    level: "error",
    message: "Échec de connexion à la base de données après 3 tentatives.",
    time: "Il y a 8 minutes",
  },
  {
    id: "n2",
    projectId: "guardian-front",
    projectName: "Guardian Front",
    level: "warning",
    message: "Temps de réponse anormalement élevé sur /api/logs.",
    time: "Il y a 45 minutes",
  },
  {
    id: "n3",
    projectId: "guardian-api",
    projectName: "Guardian API",
    level: "info",
    message: "Déploiement réussi sur la branche main.",
    time: "Il y a 12 minutes",
  },
];

export const statusLabels: Record<ProjectStatus, string> = {
  good: "Opérationnel",
  warning: "Avertissement",
  critical: "Critique",
};

export const statusDotClasses: Record<ProjectStatus, string> = {
  good: "bg-status-good",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
};
