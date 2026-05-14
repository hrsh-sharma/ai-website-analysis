interface SeverityBadgeProps {
  severity: 'critical' | 'major' | 'minor'
}

const config = {
  critical: { label: 'Critical', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  major:    { label: 'Major',    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  minor:    { label: 'Minor',    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { label, className } = config[severity] ?? config.minor
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide ${className}`}>
      {label}
    </span>
  )
}
