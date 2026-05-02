import type { FC } from 'react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: { value: number; positive: boolean }
}

export const StatCard: FC<StatCardProps> = ({ label, value, sub, trend }) => {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
      {trend && (
        <span className={`stat-card__trend ${trend.positive ? 'up' : 'down'}`}>
          {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
        </span>
      )}
    </div>
  )
}