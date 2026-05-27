import winston from 'winston'

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

const formats = [
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
]

if (process.env.NODE_ENV !== 'production') {
  formats.push(winston.format.colorize())
  formats.push(winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} [${level}]: ${message}${metaStr}`
  }))
} else {
  formats.push(winston.format.json())
}

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(...formats),
  defaultMeta: { service: 'osanvault-api' },
  transports: [new winston.transports.Console()],
})

export const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'osanvault-api', type: 'security' },
  transports: [new winston.transports.Console()],
})

export function auditEvent(action: string, details: Record<string, unknown>) {
  securityLogger.warn(`AUDIT: ${action}`, { action, ...details })
}

export function securityAlert(type: string, details: Record<string, unknown>) {
  securityLogger.error(`SECURITY_ALERT: ${type}`, { alert_type: type, ...details })
}

export function suspiciousActivity(ip: string, action: string, details: Record<string, unknown>) {
  securityLogger.warn(`SUSPICIOUS: ${action} from ${ip}`, { ip, action, ...details })
}