export function AppIconImage({ size }: { size: number }) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.34);

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0f172a",
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #334155",
      }}
    >
      <span
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: "italic",
          fontSize,
          fontWeight: 400,
          color: "#fafafa",
          letterSpacing: "0.06em",
        }}
      >
        Spello
      </span>
    </div>
  );
}
