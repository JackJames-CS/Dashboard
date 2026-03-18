const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const icalUrl = Deno.env.get('MOODLE_ICAL_URL')
  if (!icalUrl) {
    return new Response(JSON.stringify({ error: 'MOODLE_ICAL_URL not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const res = await fetch(icalUrl)
  if (!res.ok) {
    return new Response(JSON.stringify({ error: `iCal fetch failed: ${res.status}` }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const ical = await res.text()
  const events = parseIcal(ical)

  return new Response(JSON.stringify(events), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

function parseIcal(ical: string) {
  // Unfold folded lines (RFC 5545: CRLF + whitespace = continuation)
  const text = ical.replace(/\r?\n[ \t]/g, '')
  const lines = text.split(/\r?\n/)

  const events: { title: string; due: string; description: string }[] = []
  let current: Record<string, string> | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
    } else if (line === 'END:VEVENT' && current) {
      const title = current['SUMMARY'] ?? 'Untitled'
      // DTSTART may have a TZID param: DTSTART;TZID=Europe/Dublin:20250318T120000
      const rawDate = current['DTSTART'] ?? current['DUE'] ?? null
      if (rawDate) {
        events.push({
          title: unescapeIcal(title),
          due: parseIcalDate(rawDate),
          description: unescapeIcal(current['DESCRIPTION'] ?? ''),
        })
      }
      current = null
    } else if (current) {
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) continue
      // Strip property parameters (e.g. DTSTART;TZID=... → DTSTART)
      const key = line.slice(0, colonIdx).split(';')[0]
      const value = line.slice(colonIdx + 1)
      current[key] = value
    }
  }

  return events
}

function parseIcalDate(value: string): string {
  // Strip any TZID parameter prefix that may have survived (shouldn't after split, but just in case)
  const clean = value.includes(':') ? value.split(':').pop()! : value

  if (clean.length === 8) {
    // Date-only: 20250318
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T23:59:00.000Z`
  }

  // DateTime: 20250318T120000Z or 20250318T120000
  const y = clean.slice(0, 4)
  const mo = clean.slice(4, 6)
  const d = clean.slice(6, 8)
  const h = clean.slice(9, 11)
  const mi = clean.slice(11, 13)
  const s = clean.slice(13, 15)
  const utc = clean.endsWith('Z') ? 'Z' : ''

  return `${y}-${mo}-${d}T${h}:${mi}:${s}${utc}`
}

function unescapeIcal(s: string): string {
  return s.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')
}
