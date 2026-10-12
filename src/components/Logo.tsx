export function Logo() {
  return (
    <span className="flex items-center gap-2 font-bold tracking-tight">
      <span className="wave flex h-7 w-7 items-end justify-center gap-[2px] rounded-lg bg-gradient-to-br from-brand-500 to-glow-500 p-1.5" aria-hidden>
        {[0.6, 1, 0.75, 0.9].map((h, i) => (
          <span key={i} className="w-[3px] rounded-full bg-white" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span>Voix<span className="gradient-text">XP</span></span>
    </span>
  );
}
