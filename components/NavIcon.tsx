interface NavIconProps {
  name: "overview" | "expenses" | "funding" | "log" | "settings";
  active?: boolean;
}

export default function NavIcon({ name, active }: NavIconProps) {
  const stroke = active ? "#60a5fa" : "#64748b";
  const fill = active ? "#60a5fa" : "none";

  const icons = {
    overview: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5H15v-5.5h-6V20.5H5.5A1.5 1.5 0 014 19v-8.5z"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinejoin="round"
          fill={active ? "rgba(96,165,250,0.15)" : "none"}
        />
      </svg>
    ),
    expenses: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke={stroke}
          strokeWidth="1.75"
          fill={active ? "rgba(96,165,250,0.15)" : "none"}
        />
        <path d="M7 9h10M7 13h6" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    funding: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke={stroke}
          strokeWidth="1.75"
          fill={active ? "rgba(96,165,250,0.15)" : "none"}
        />
        <path
          d="M12 7v10M9.5 9.5c0-1.1 1.12-2 2.5-2s2.5.9 2.5 2-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
    log: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M8 4h8l2 2v14H6V4h2z"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinejoin="round"
          fill={active ? "rgba(96,165,250,0.15)" : "none"}
        />
        <path d="M9 11h6M9 15h4" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
    settings: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth="1.75" fill={fill} fillOpacity={active ? 0.3 : 0} />
        <path
          d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return icons[name];
}
