import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

// ── Block types ──────────────────────────────────────────────

type Block =
  | { kind: 'name';    text: string }
  | { kind: 'contact'; text: string }
  | { kind: 'divider' }
  | { kind: 'section'; text: string }
  | { kind: 'bullet';  text: string }
  | { kind: 'body';    text: string }
  | { kind: 'spacer' }

// ── Text parser ──────────────────────────────────────────────

const BULLET_RE   = /^[•\-*◦▪–—]\s*/
const CONTACT_RE  = /@|\blinkedin\b|\bgithub\b|\bphone\b|\d{3}[.\-()\s]\d{3}/i
const SECTION_RE  = /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|PROJECTS?|CERTIFICATIONS?|PUBLICATIONS?|AWARDS?|VOLUNTEER|REFERENCES|WORK HISTORY|PROFESSIONAL|TECHNICAL SKILLS?|LANGUAGES?|INTERESTS?|ACTIVITIES|ADDITIONAL)/i

function isAllCaps(s: string) {
  return s.length > 2 && s === s.toUpperCase() && /[A-Z]/.test(s) && !/\d{4}/.test(s)
}

function isSectionHeader(line: string) {
  if (line.length > 60) return false
  return SECTION_RE.test(line) || isAllCaps(line)
}

function parseResume(text: string): Block[] {
  const lines = text.split(/\r?\n/)
  const blocks: Block[] = []
  let i = 0

  // skip leading blank lines
  while (i < lines.length && !lines[i].trim()) i++

  // first non-empty line → name
  if (i < lines.length) {
    blocks.push({ kind: 'name', text: lines[i].trim() })
    i++
  }

  // next few lines: contact info
  let contactCount = 0
  while (i < lines.length && contactCount < 6) {
    const line = lines[i].trim()
    if (!line) { i++; continue }
    if (isSectionHeader(line) || BULLET_RE.test(line)) break
    if (CONTACT_RE.test(line) || line.includes('|') || contactCount < 1) {
      blocks.push({ kind: 'contact', text: line })
      contactCount++
      i++
    } else {
      break
    }
  }

  // divider after name/contact block
  blocks.push({ kind: 'divider' })

  // remaining body
  let prevSpacer = false
  while (i < lines.length) {
    const line = lines[i].trim()
    i++

    if (!line) {
      if (!prevSpacer) { blocks.push({ kind: 'spacer' }); prevSpacer = true }
      continue
    }
    prevSpacer = false

    if (isSectionHeader(line)) {
      blocks.push({ kind: 'section', text: line })
    } else if (BULLET_RE.test(line)) {
      blocks.push({ kind: 'bullet', text: line.replace(BULLET_RE, '') })
    } else {
      blocks.push({ kind: 'body', text: line })
    }
  }

  return blocks
}

// ── Styles ───────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 52,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  contact: {
    fontSize: 9.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 1,
  },
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    marginTop: 10,
    marginBottom: 2,
  },
  section: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    // textTransform not rendering in all react-pdf builds — uppercase in data instead
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: '#cbd5e1',
  },
  body: {
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.55,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
    paddingLeft: 6,
  },
  bulletDot: {
    fontSize: 10,
    color: '#64748b',
    marginRight: 6,
    lineHeight: 1.55,
  },
  bulletText: {
    fontSize: 10,
    color: '#1e293b',
    lineHeight: 1.55,
    flex: 1,
  },
  spacer: {
    marginBottom: 5,
  },
})

// ── ResumeDocument ────────────────────────────────────────────

export function ResumeDocument({ text }: { text: string }) {
  const blocks = parseResume(text)

  return (
    <Document>
      <Page size="LETTER" style={S.page}>
        {blocks.map((block, idx) => {
          switch (block.kind) {
            case 'name':
              return <Text key={idx} style={S.name}>{block.text}</Text>

            case 'contact':
              return <Text key={idx} style={S.contact}>{block.text}</Text>

            case 'divider':
              return <View key={idx} style={S.divider} />

            case 'section':
              // uppercase manually — safer across react-pdf versions
              return <Text key={idx} style={S.section}>{block.text.toUpperCase()}</Text>

            case 'bullet':
              return (
                <View key={idx} style={S.bulletRow}>
                  <Text style={S.bulletDot}>•</Text>
                  <Text style={S.bulletText}>{block.text}</Text>
                </View>
              )

            case 'body':
              return <Text key={idx} style={S.body}>{block.text}</Text>

            case 'spacer':
              return <View key={idx} style={S.spacer} />

            default:
              return null
          }
        })}
      </Page>
    </Document>
  )
}

// ── generateResumePDF ─────────────────────────────────────────

export async function generateResumePDF(text: string): Promise<string> {
  const blob = await pdf(<ResumeDocument text={text} />).toBlob()
  return URL.createObjectURL(blob)
}
