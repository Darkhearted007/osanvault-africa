export const fmt = (n: number) => n.toLocaleString("en-NG")

export const fundedPct = (sold: number, total: number) => Math.round((sold / total) * 100)

export const timeAgo = (iso: string) => {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (h < 1) return "just now"
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
