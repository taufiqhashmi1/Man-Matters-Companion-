"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/use-app-store";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const isHydrated = useAppStore((s) => s.isHydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellness-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-wellness-accent border-t-transparent animate-spin" />
          <p className="text-xs text-wellness-secondary font-medium tracking-wide">
            Loading Man Matters Companion...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
