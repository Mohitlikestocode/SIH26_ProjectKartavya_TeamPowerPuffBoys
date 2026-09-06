import { useState } from "react";
import { css } from "../lib/css";

// Static stand-in for the design tool's <image-slot> custom element (drag-drop
// photo upload with a persistence sidecar — infrastructure that only exists
// inside the Claude Design canvas). Renders the same empty-state chrome
// (dashed ring, icon, caption) so the layout matches when no photo is set.
//
// Pass `src` (and ideally `alt`) to render a real image filling the slot; if it
// fails to load, it falls back to the empty-state chrome so the layout never
// breaks on a missing file.
export default function ImageSlot({
  shape = "rounded",
  radius = 12,
  style,
  placeholder = "Drop an image",
  src,
  alt = "",
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  const shapeStyle =
    shape === "circle" ? { borderRadius: "50%" }
    : shape === "pill" ? { borderRadius: "9999px" }
    : shape === "rect" ? { borderRadius: 0 }
    : { borderRadius: `${radius}px` };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "rgba(127,127,127,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        textAlign: "center",
        padding: 12,
        boxSizing: "border-box",
        color: "inherit",
        ...shapeStyle,
        ...style,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <>
          <div style={css("position:absolute; inset:0; pointer-events:none; border:1.5px dashed currentColor; opacity:0.35")}></div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
          </svg>
          <div style={{ maxWidth: "90%", fontWeight: 500, fontSize: 12.5, opacity: 0.75, letterSpacing: "0.01em" }}>{placeholder}</div>
        </>
      )}
    </div>
  );
}
