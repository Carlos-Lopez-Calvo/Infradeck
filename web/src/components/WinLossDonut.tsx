type WinLossDonutProps = {
  wins: number
  losses: number
  size?: number
}

export function WinLossDonut({ wins, losses, size = 140 }: WinLossDonutProps) {
  const total = wins + losses
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  if (total === 0) {
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-700"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-2xl font-semibold text-slate-400">0</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">partidas</div>
        </div>
      </div>
    )
  }

  const winLen = (wins / total) * circumference
  const lossLen = circumference - winLen

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {wins > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth={stroke}
            strokeDasharray={`${winLen} ${circumference}`}
            strokeLinecap="butt"
          />
        )}
        {losses > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={stroke}
            strokeDasharray={`${lossLen} ${circumference}`}
            strokeDashoffset={-winLen}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-semibold text-slate-100">{total}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400">partidas</div>
      </div>
    </div>
  )
}
