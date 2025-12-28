
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Logger } from './Logger.js'
import { RabbitConsumer } from './providers/RabbitConsumer.js'
import { SmartAlarmHandler } from './handlers/SmartAlarmHandler.js'


dotenv.config({ quiet: true })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONSUMER_LOG_PATH = path.resolve(__dirname, '../logs/rpp-consumer-node.log')

const logger = new Logger(CONSUMER_LOG_PATH)
const smartAlarmHandler = new SmartAlarmHandler(logger)

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`

const consumer = new RabbitConsumer({
    url: RABBITMQ_URL,
    queue: 'rustplus_alarms',
    logger,
    handler: smartAlarmHandler
})

async function shutdown(signal) {
    logger.info(`Señal ${signal} recibida`)

    try {
        await consumer.stop()
    } catch (err) {
        logger.error(err.message)
    } finally {
        process.exit(0)
    }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

consumer.start().catch(err => {
    logger.error(`Error fatal: ${err.message}`)
    process.exit(1)
})
