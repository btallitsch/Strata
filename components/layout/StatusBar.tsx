import { C, font } from "@/lib/constants/tokens";

const STATUS_ITEMS = [
  { label: "Model Version",    value: "v1.0.0" },
  { label: "Data Last Synced", value: "Mar 2, 2026 09:41" },
  { label: "Offline Mode",     value: "Active" },
];

export default function StatusBar() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: "8px 32px",
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      {STATUS_ITEMS.map((item) => (
        <span
          key={item.label}
          style={{ fontFamily: font.mono, fontSize: 10, color: C.muted }}
        >
          {item.label}:{" "}
          <span style={{ color: C.body }}>{item.value}</span>
        </span>
      ))}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: C.accent,
            boxShadow: `0 0 8px ${C.accent}`,
          }}
        />
        <span style={{ fontFamily: font.mono, fontSize: 10, color: C.accent }}>
          Engine Online
        </span>
      </div>
    </div>
  );
}
