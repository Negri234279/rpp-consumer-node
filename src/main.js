import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { RABBITMQ_URL } from './infra/config/config.js'
import { HttpServer } from './infra/http/httpServer.js'
import { HandlerFactory } from './infra/messaging/handlers/handlerFactory.js'
import { RabbitMQBroker } from './infra/messaging/RabbitMQBroker.js'
import { ConsoleLogger } from './infra/monitoring/ConsoleLogger.js'
import { PrometheusMetrics } from './infra/monitoring/PrometheusMetrics.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONSUMER_LOG_PATH = path.resolve(__dirname, '../logs/rpp-consumer-node.log')

const logger = new ConsoleLogger({ path: CONSUMER_LOG_PATH })
const metricsRecorder = new PrometheusMetrics({ logger })

const handlerFactory = new HandlerFactory({
    logger,
    metricsRecorder,
})

const smartAlarmHandler = handlerFactory.createSmartAlarmHandler()

const broker = new RabbitMQBroker({
    url: RABBITMQ_URL,
    queue: 'rustplus_alarms',
    messageConsumerHandler: smartAlarmHandler,
    logger,
    metricsRecorder,
})

const httpServer = new HttpServer({
    metricsRecorder,
    logger,
})

try {
    await broker.connect()
    await httpServer.start()

    await broker.consuming()

    logger.success('✅ Aplicación iniciada correctamente')
} catch (error) {
    logger.error('❌ Error al iniciar aplicación:', error)
    process.exit(1)
}

async function shutdown(signal) {
    logger.info(`Señal ${signal} recibida`)

    try {
        await broker.stop()
        await httpServer.stop()
    } catch (err) {
        logger.error('Error durante shutdown:', err)
    } finally {
        process.exit(0)
    }
}

process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err)
    process.exit(1)
})

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err)
})

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
