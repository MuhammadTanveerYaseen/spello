interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizes = {
  sm: { box: "h-9 w-9", text: "text-xs", sc: "text-sm", sub: "text-[8px]" },
  md: { box: "h-11 w-11", text: "text-sm", sc: "text-base", sub: "text-[9px]" },
  lg: { box: "h-16 w-16", text: "text-base", sc: "text-xl", sub: "text-[10px]" },
};

export default function AppLogo({ size = "md", showText = true }: AppLogoProps) {
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${showText ? "" : ""}`}>
      <div
        className={`${s.box} flex shrink-0 flex-col items-center justify-center rounded-[22%] border border-slate-600 bg-slate-900`}
        aria-hidden
      >
        <span className={`${s.sc} font-bold leading-none tracking-tighter text-blue-500`}>
          SC
        </span>
        <span className={`${s.sub} mt-0.5 font-semibold tracking-[0.2em] text-slate-500`}>
          SPELLO
        </span>
      </div>
      {showText && (
        <div className="min-w-0">
          <p className={`${s.text} font-bold leading-tight text-white`}>Spello Cafe</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Expenses</p>
        </div>
      )}
    </div>
  );
}
