import amqp from 'amqplib'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({ quiet: true })

const {
    RABBITMQ_HOST,
    RABBITMQ_PORT,
    RABBITMQ_USER,
    RABBITMQ_PASSWORD,
} = process.env

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const QUEUE = 'rustplus_alarms'
const LOG_PATH = path.resolve(__dirname, '../logs/consumer.log')

fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true })

/**
 * @type {import('amqplib').Connection}
 */
let connection
/**
 * @type {import('amqplib').Channel}
 */
let channel
let isShuttingDown = false

function log(message) {
    const line = `[${new Date().toISOString()}] ${message}\n`
    console.log(line.trim())
    fs.appendFileSync(LOG_PATH, line)
}

async function start() {
    const url = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`

    log(`Conectando a RabbitMQ en ${url}`)

    connection = await amqp.connect(url)
    channel = await connection.createChannel()

    await channel.assertQueue(QUEUE, { durable: true })
    await channel.prefetch(1)

    log(`Escuchando mensajes en "${QUEUE}"...`)

    channel.consume(QUEUE, async (msg) => {
        if (!msg || isShuttingDown) return

        try {
            const payload = JSON.parse(msg.content.toString())
            log(`Mensaje recibido:\n${JSON.stringify(payload, null, 2)}`)

            channel.ack(msg)
        } catch (err) {
            log(`Error procesando mensaje: ${err.message}`)
            channel.nack(msg, false, false)
        }
    })
}

async function shutdown(signal) {
    if (isShuttingDown) return
    isShuttingDown = true

    log(`Recibida señal ${signal}. Cerrando consumidor...`)

    try {
        if (channel) {
            log('Cerrando canal...')
            await channel.close()
        }

        if (connection) {
            log('Cerrando conexión...')
            await connection.close()
        }
    } catch (err) {
        log(`Error durante el cierre: ${err.message}`)
    } finally {
        log('Shutdown completo. Saliendo.')
        process.exit(0)
    }
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

start().catch(err => {
    log(`Error fatal: ${err.message}`)
    process.exit(1)
})
