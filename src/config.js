import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const { env } = process

const RABBITMQ_URL = `amqp://${env.RABBITMQ_USER}:${env.RABBITMQ_PASSWORD}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`
const METRICS_ENABLED = (env.METRICS_ENABLED ?? false) === 'true'
const METRICS_PORT = env.METRICS_PORT || 9100

export { RABBITMQ_URL, METRICS_ENABLED, METRICS_PORT }
