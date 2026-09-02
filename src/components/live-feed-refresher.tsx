"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveFeedRefresher() {
  const router = useRouter();

  useEffect(() => {
    // Refresh the router periodically to fetch new server-rendered content
    // This gives the illusion of a live feed for the demo.
    const interval = setInterval(() => {
      router.refresh();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [router]);

  return null; // completely invisible
}
