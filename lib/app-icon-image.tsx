export function AppIconImage({ size }: { size: number }) {
  const radius = Math.round(size * 0.223);
  const border = Math.max(2, Math.round(size * 0.02));
  const scSize = Math.round(size * 0.34);
  const subSize = Math.round(size * 0.09);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0f172a",
        borderRadius: radius,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: `${border}px solid #334155`,
      }}
    >
      <div
        style={{
          fontSize: scSize,
          color: "#3b82f6",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: -2,
        }}
      >
        SC
      </div>
      <div
        style={{
          fontSize: subSize,
          color: "#64748b",
          fontWeight: 600,
          letterSpacing: 3,
          marginTop: Math.round(size * 0.04),
        }}
      >
        SPELLO
      </div>
    </div>
  );
}
