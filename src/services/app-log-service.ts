export type AppLogLevel = 'info' | 'warn' | 'error'

export type AppLogEntry = {
  id: string
  level: AppLogLevel
  event: string
  message: string
  metadata?: Record<string, unknown>
  createdAt: string
}

const MAX_ENTRIES = 120
const entries: AppLogEntry[] = []

const pushEntry = (
  level: AppLogLevel,
  event: string,
  message: string,
  metadata?: Record<string, unknown>,
) => {
  const entry: AppLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    level,
    event,
    message,
    metadata,
    createdAt: new Date().toISOString(),
  }

  entries.unshift(entry)
  if (entries.length > MAX_ENTRIES) entries.pop()

  if (__DEV__) {
    const prefix = `[${level}] ${event}`
    if (level === 'error') console.error(prefix, message, metadata)
    else if (level === 'warn') console.warn(prefix, message, metadata)
  }
}

export const AppLogService = {
  info(event: string, message: string, metadata?: Record<string, unknown>) {
    pushEntry('info', event, message, metadata)
  },

  warn(event: string, message: string, metadata?: Record<string, unknown>) {
    pushEntry('warn', event, message, metadata)
  },

  error(event: string, message: string, metadata?: Record<string, unknown>) {
    pushEntry('error', event, message, metadata)
  },

  getRecent(limit = 40): AppLogEntry[] {
    return entries.slice(0, limit)
  },

  clear() {
    entries.length = 0
  },
}
