export const toDateStr = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayStr = (): string => toDateStr(new Date())

export const addDays = (dateStr: string, n: number): string => {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export const formatLabel = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}`
}

export const formatMonthLabel = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
}

export const getDayOfWeekLabel = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00')
  return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
}

export const getWeekDates = (baseDate: string): string[] => {
  const d = new Date(baseDate + 'T00:00:00')
  const dow = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    return toDateStr(day)
  })
}

export const getMonthDates = (dateStr: string): (string | null)[] => {
  const d = new Date(dateStr + 'T00:00:00')
  const year = d.getFullYear()
  const month = d.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= lastDate; i++) {
    cells.push(toDateStr(new Date(year, month, i)))
  }
  return cells
}

export const COLOR_MAP: Record<string, string> = {
  white: '#ffffff',
  red:   '#FECACA',
  blue:  '#BFDBFE',
  green: '#BBF7D0',
  yellow:'#FEF08A',
  gray:  '#E5E7EB',
}

export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
