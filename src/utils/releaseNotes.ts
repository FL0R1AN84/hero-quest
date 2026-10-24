export interface ReleaseNote {
  type: string
  text: string
}

const typeIcons: Record<string, string> = {
  feat: '✨',
  fix: '🐛',
  refactor: '🔧',
  style: '🎨',
  perf: '⚡',
  docs: '📖',
}

export function noteIcon(type: string): string {
  return typeIcons[type] ?? '•'
}

export function parseReleaseNote(subject: string): ReleaseNote {
  const match = /^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/.exec(subject)
  if (!match) return { type: '', text: subject }
  const [, type = '', text = subject] = match
  return { type: type.toLowerCase(), text: text.charAt(0).toUpperCase() + text.slice(1) }
}

export function parseReleaseNotes(subjects: string[]): ReleaseNote[] {
  return subjects.map(parseReleaseNote)
}
