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
    id: "argos-api",
    name: "Argos API",
    status: "good",
    githubRepo: "DwainAB/argos-back",
    githubBranch: "main",
    lastDeployAt: "Il y a 12 minutes",
  },
  {
    id: "argos-front",
    name: "Argos Front",
    status: "warning",
    githubRepo: "DwainAB/argos-front",
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
    projectId: "argos-front",
    projectName: "Argos Front",
    level: "warning",
    message: "Temps de réponse anormalement élevé sur /api/logs.",
    time: "Il y a 45 minutes",
  },
  {
    id: "n3",
    projectId: "argos-api",
    projectName: "Argos API",
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

// Message de synthèse généré par l'IA, affiché en haut de l'aperçu du projet.
export const statusSummaries: Record<ProjectStatus, string> = {
  good: "Votre serveur fonctionne normalement. Aucune erreur détectée depuis la dernière heure.",
  warning:
    "Le serveur fonctionne, mais un comportement inhabituel a été détecté récemment. Une surveillance rapprochée est recommandée.",
  critical:
    "Une erreur critique affecte actuellement ce projet. Une intervention rapide est recommandée pour éviter une interruption de service.",
};

export type LogLevel = "info" | "warning" | "error";

export type LogEntry = {
  id: string;
  projectId: string;
  level: LogLevel;
  source: string;
  rawMessage: string;
  time: string;
  aiExplanation: string;
};

export const mockLogs: LogEntry[] = [
  {
    id: "l1",
    projectId: "billing-service",
    level: "error",
    source: "database",
    rawMessage: "ECONNREFUSED 10.0.4.12:5432 — connection to Postgres pool timed out after 3 retries",
    time: "Il y a 8 minutes",
    aiExplanation:
      "Votre application n'arrive plus à joindre la base de données PostgreSQL. Cela signifie généralement que la base est éteinte, surchargée, ou que les identifiants de connexion ont changé. Vérifiez que le service de base de données est bien démarré sur Railway.",
  },
  {
    id: "l2",
    projectId: "billing-service",
    level: "warning",
    source: "api",
    rawMessage: "Response time 4200ms on /api/invoices (threshold: 2000ms)",
    time: "Il y a 22 minutes",
    aiExplanation:
      "Une requête a mis plus de 4 secondes à répondre, ce qui est deux fois plus lent que la normale. Ce n'est pas encore critique, mais si ça se reproduit souvent, vos utilisateurs risquent de ressentir des lenteurs.",
  },
  {
    id: "l3",
    projectId: "argos-front",
    level: "warning",
    source: "api",
    rawMessage: "GET /api/logs 200 OK — 1850ms (threshold: 1000ms)",
    time: "Il y a 45 minutes",
    aiExplanation:
      "Cette page a mis plus de temps que prévu à charger. La requête a fini par réussir, donc ce n'est pas une panne, mais un ralentissement à surveiller si ça devient fréquent.",
  },
  {
    id: "l4",
    projectId: "argos-api",
    level: "info",
    source: "deploy",
    rawMessage: "Deployment succeeded — commit 4c9fa86 on branch main",
    time: "Il y a 12 minutes",
    aiExplanation:
      "Un nouveau déploiement de votre code a réussi sans problème. Rien à faire, c'est une information normale.",
  },
  {
    id: "l5",
    projectId: "argos-api",
    level: "info",
    source: "api",
    rawMessage: "GET /health 200 OK — 42ms",
    time: "Il y a 15 minutes",
    aiExplanation: "Vérification de bon fonctionnement du serveur, tout est normal.",
  },
];

export type Alert = {
  id: string;
  projectId: string;
  level: LogLevel;
  title: string;
  message: string;
  time: string;
  relatedLogId: string;
  aiExplanation: string;
  suggestion: string;
};

export const mockAlerts: Alert[] = [
  {
    id: "a1",
    projectId: "billing-service",
    level: "error",
    title: "Connexion à la base de données perdue",
    message: "ECONNREFUSED 10.0.4.12:5432 — connection to Postgres pool timed out after 3 retries",
    time: "Il y a 8 minutes",
    relatedLogId: "l1",
    aiExplanation:
      "Votre application n'arrive plus à joindre la base de données PostgreSQL après 3 tentatives. C'est ce type d'erreur qui empêche généralement l'application de fonctionner correctement pour vos utilisateurs.",
    suggestion:
      "Vérifiez que le service de base de données est bien démarré sur Railway, et que les variables de connexion (hôte, port, identifiants) n'ont pas changé récemment.",
  },
  {
    id: "a2",
    projectId: "argos-front",
    level: "warning",
    title: "Temps de réponse élevé",
    message: "GET /api/logs 200 OK — 1850ms (seuil: 1000ms)",
    time: "Il y a 45 minutes",
    relatedLogId: "l3",
    aiExplanation:
      "Cette route a mis presque deux fois plus de temps que la normale à répondre. Isolé, ce n'est pas grave, mais une récurrence peut indiquer un problème de performance à venir.",
    suggestion: "Surveillez si ce ralentissement se reproduit dans les prochaines heures.",
  },
];
