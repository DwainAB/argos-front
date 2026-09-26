"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { apiFetch } from "@/lib/api-fetch";

type TimeseriesRange = "24h" | "7d" | "30d";

type TimeseriesPoint = {
  timestamp: string;
  errorCount: number;
  warningCount: number;
};

const RANGE_OPTIONS: { value: TimeseriesRange; label: string }[] = [
  { value: "24h", label: "24 heures" },
  { value: "7d", label: "Semaine" },
  { value: "30d", label: "Mois" },
];

function formatTick(timestamp: string, range: TimeseriesRange) {
  const date = new Date(timestamp);
  if (range === "24h") {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function LogsTimeseriesChart({ projectId }: { projectId: string }) {
  const [range, setRange] = useState<TimeseriesRange>("24h");
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiFetch(`/api/projects/${projectId}/timeseries?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPoints(data.points ?? []);
      })
      .catch((err) => console.error("Erreur lors du chargement de la série temporelle :", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, range]);

  const chartData = points.map((p) => ({
    ...p,
    label: formatTick(p.timestamp, range),
  }));

  return (
    <div className="rounded-xl border border-surface-border/10 bg-surface-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-ink-primary">Erreurs et avertissements</h2>
          <div className="flex items-center gap-3 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-status-critical" />
              Erreurs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-status-warning" />
              Avertissements
            </span>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg bg-surface p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRange(option.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                range === option.value
                  ? "bg-accent-500/10 text-accent-400"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-secondary">Chargement...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface-border))" strokeOpacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgb(var(--ink-muted))", fontSize: 11 }}
                axisLine={{ stroke: "rgb(var(--surface-border))", strokeOpacity: 0.2 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "rgb(var(--ink-muted))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--surface))",
                  border: "1px solid rgb(var(--surface-border) / 0.2)",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "rgb(var(--ink-primary))" }}
              />
              <Line
                type="monotone"
                dataKey="errorCount"
                name="Erreurs"
                stroke="#F87171"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="warningCount"
                name="Avertissements"
                stroke="#FBBF24"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
