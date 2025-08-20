"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Eye, EyeOff } from "lucide-react";

export function AdminToggle() {
  const [status, setStatus] = useState<{
    enabled: boolean;
    message: string;
    updated_at: string;
  } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/toggle-coming-soon");
      if (res.ok) {
        const json = await res.json();
        setStatus(json?.data);
      }
    };
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const res = await fetch("/api/toggle-coming-soon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle: true }),
      });
      const json = await res.json();
      setStatus(json?.data);
    } catch (e) {
      console.error("Toggle failed", e);
    } finally {
      setIsToggling(false);
    }
  };

  if (!status) return null;

  return (
    <Card className="bg-pf-surface border-pf-text-muted/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gold-industrial" />
          <CardTitle className="text-pf-text">Coming Soon Control</CardTitle>
        </div>
        <CardDescription className="text-pf-text-muted">
          Activează sau dezactivează landingul de tip "Coming Soon"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status.enabled ? (
              <EyeOff className="w-5 h-5 text-gold-industrial" />
            ) : (
              <Eye className="w-5 h-5 text-gold-industrial" />
            )}
            <span className="text-pf-text">
              {status.enabled ? "Coming Soon Active" : "Site Live"}
            </span>
          </div>
          <div className="w-8 h-4 bg-pf-text-muted rounded-full flex items-center">
            <div
              className={`w-4 h-4 rounded-full transition-all ${
                status.enabled
                  ? "bg-gold-industrial translate-x-4"
                  : "bg-pf-text-muted translate-x-0"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={status.enabled ? "default" : "secondary"}
            className={
              status.enabled
                ? "bg-gold-industrial/10 text-gold-industrial border-gold-industrial/20"
                : "bg-pf-text-muted/20 text-pf-text-muted border-pf-text-muted/30"
            }
          >
            {status.enabled ? "ENABLED" : "DISABLED"}
          </Badge>
          <span className="text-sm text-pf-text-muted">{status.message}</span>
        </div>

        {status.updated_at && (
          <div className="text-xs text-pf-text-muted">
            Last updated: {new Date(status.updated_at).toLocaleString()}
          </div>
        )}

        <div className="pt-4 border-t border-pf-text-muted/20">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            {isToggling
              ? "Processing..."
              : `Turn ${status.enabled ? "Off" : "On"}`}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
