import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Defer state update to avoid cascading renders
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const { theme } = useAppContext();

  if (hasHydrated) {
    return theme;
  }

  return "dark";
}
