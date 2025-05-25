import ical from 'ical-generator'

export interface StudyEvent {
  title: string
  start: Date
  end: Date
  description?: string
  location?: string
}

export function generateICSFile(
  events: StudyEvent[],
  title: string = 'CertCafe 학습 루틴'
): string {
  const calendar = ical({
    name: title,
    prodId: '//CertCafe//Study Routine//KR',
    timezone: 'Asia/Seoul',
  })

  events.forEach(event => {
    calendar.createEvent({
      start: event.start,
      end: event.end,
      summary: event.title,
      description: event.description || '',
      location: event.location || 'CertCafe 앱',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://certcafe.com',
    })
  })

  return calendar.toString()
}

export function downloadICSFile(icsContent: string, filename: string = 'study-routine.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}