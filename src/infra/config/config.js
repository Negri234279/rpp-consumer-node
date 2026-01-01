import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const { env } = process

const RABBITMQ_URL = `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`
const METRICS_ENABLED = (env.METRICS_ENABLED ?? false) === 'true'
const METRICS_PORT = parseInt(env.METRICS_PORT) || 9100
const TZ = env.TZ || 'Europe/Madrid'
const LOCALE = env.LOCALE || 'es-ES'
/**
 * @type {'production' | 'development'}
 */
const NODE_ENV = env.NODE_ENV || 'production'

export { RABBITMQ_URL, METRICS_ENABLED, METRICS_PORT, TZ, LOCALE, NODE_ENV }
