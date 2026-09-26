"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/api-fetch";

type ProjectAlertsSummary = {
  projectId: string;
  projectName: string;
  errorCount: number;
  warningCount: number;
};

export function ProjectAlertsSummaryChart() {
  const [summary, setSummary] = useState<ProjectAlertsSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/projects/alerts-summary")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSummary(data.summary ?? []);
      })
      .catch((err) => console.error("Erreur lors du chargement du résumé des alertes par projet :", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Une ligne par projet : hauteur du graphique proportionnelle au nombre de projets.
  const chartHeight = Math.max(summary.length * 44, 100);

  return (
    <div className="rounded-xl border border-surface-border/10 bg-surface-raised p-4">
      <h2 className="text-sm font-semibold text-ink-primary">Erreurs et avertissements par projet</h2>
      <p className="mt-1 text-xs text-ink-secondary">
        Projets triés par volume (24h), du plus problématique au plus calme.
      </p>

      <div className="mt-4">
        {loading ? (
          <p className="py-6 text-center text-sm text-ink-secondary">Chargement...</p>
        ) : summary.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-secondary">Aucun projet connecté.</p>
        ) : (
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" strokeOpacity={0.2} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "rgb(var(--ink-muted))", fontSize: 11 }}
                  axisLine={{ stroke: "rgb(var(--surface-border))", strokeOpacity: 0.2 }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="projectName"
                  tick={{ fill: "rgb(var(--ink-primary))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(var(--surface))",
                    border: "1px solid rgb(var(--surface-border) / 0.2)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                  labelStyle={{ display: "none" }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="errorCount" name="Erreurs" fill="#F87171" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="warningCount" name="Avertissements" fill="#FBBF24" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!loading && summary.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-surface-border/10 pt-3">
          {summary.slice(0, 3).map((project) =>
            project.errorCount + project.warningCount > 0 ? (
              <Link
                key={project.projectId}
                href={`/dashboard/projects/${project.projectId}/alerts`}
                className="text-xs text-accent-400 hover:text-accent-300"
              >
                Voir les alertes de {project.projectName} →
              </Link>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
