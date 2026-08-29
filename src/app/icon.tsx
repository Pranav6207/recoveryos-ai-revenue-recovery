import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1326", color: "#f5b544", fontSize: 250, fontWeight: 800, fontFamily: "Arial" }}>
      R
    </div>,
    { ...size },
  );
}
