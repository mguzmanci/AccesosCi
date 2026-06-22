"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  badge?: number;
  content: ReactNode;
}

export function DashboardTabs({
  tabs,
  tabInicial,
  size = "md",
}: {
  tabs: Tab[];
  tabInicial?: string;
  size?: "md" | "sm";
}) {
  const [activo, setActivo] = useState(tabInicial ?? tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivo(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 font-medium transition-colors",
              size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
              activo === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={size === "md" ? "pt-6" : "pt-4"}>
        {tabs.find((t) => t.id === activo)?.content}
      </div>
    </div>
  );
}
