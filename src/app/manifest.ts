import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RecoveryOS - AI Revenue Recovery",
    short_name: "RecoveryOS",
    description: "A transparent AI revenue recovery command center.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#0b1326",
    icons: [{ src: "/icon", sizes: "any", type: "image/png" }],
  };
}
