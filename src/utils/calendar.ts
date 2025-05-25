export interface CalendarEvent {
  title: string
  start: Date
  end: Date
  description?: string
}

export function generateICS(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CertCafe//CertCafe App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ]

  events.forEach(event => {
    const startDate = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endDate = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `UID:${Date.now()}@certcafe.com`,
      'END:VEVENT'
    )
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}