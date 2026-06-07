interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  tagline?: string;
  align?: "left" | "center";
  className?: string;
}

const wordSizes = {
  sm: "text-[1.5rem]",
  md: "text-[2rem]",
  lg: "text-[3rem]",
};

const taglineSizes = {
  sm: "text-[8px] tracking-[0.3em]",
  md: "text-[9px] tracking-[0.32em]",
  lg: "text-[10px] tracking-[0.36em]",
};

export default function AppLogo({
  size = "md",
  tagline,
  align = "left",
  className = "",
}: AppLogoProps) {
  return (
    <div className={`${align === "center" ? "text-center" : "text-left"} ${className}`}>
      <span className={`logo-wordmark ${wordSizes[size]}`}>Spello</span>
      {tagline && (
        <p className={`logo-tagline mt-2 ${taglineSizes[size]}`}>{tagline}</p>
      )}
    </div>
  );
}
