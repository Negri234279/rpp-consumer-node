import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { AlarmMetricsService } from './AlarmMetricsService.js'
import { SmartAlarmHandler } from './handlers/SmartAlarmHandler.js'
import { Logger } from './Logger.js'
import { startMetricsServer } from './metricsServer.js'
import { PrometheusMetrics } from './PrometheusMetrics.js'
import { RabbitConsumer } from './providers/RabbitConsumer.js'
import { RABBITMQ_URL } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONSUMER_LOG_PATH = path.resolve(__dirname, '../logs/rpp-consumer-node.log')

const logger = new Logger({ path: CONSUMER_LOG_PATH })
const metrics = new PrometheusMetrics({ logger })

startMetricsServer({ metrics, logger })

const alarmMetricsService = new AlarmMetricsService({ metrics })
const smartAlarmHandler = new SmartAlarmHandler({ logger, alarmMetricsService })

const consumer = new RabbitConsumer({
    url: RABBITMQ_URL,
    queue: 'rustplus_alarms',
    logger,
    handler: smartAlarmHandler,
})

async function shutdown(signal) {
    logger.info(`Señal ${signal} recibida`)

    try {
        await consumer.stop()
    } catch (err) {
        logger.error(err)
    } finally {
        process.exit(0)
    }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

process.on('uncaughtException', (err) => {
    logger.error(err)
    process.exit(1)
})

process.on('unhandledRejection', (err) => {
    logger.error(err)
})

consumer
    .connect()
    .then(async () => {
        await consumer.consume()
    })
    .catch(async (err) => {
        logger.error(err)
        await consumer.stop()
        process.exit(1)
    })
