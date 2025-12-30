import amqp from 'amqplib'

import { METRICS_ENABLED } from '../config.js'

export class RabbitConsumer {
    constructor({ url, queue, exchange = null, logger, handler = null, prometheusMetrics = null }) {
        this.url = url
        this.queue = queue
        this.exchange = exchange
        this.logger = logger
        this.handler = handler
        this.prometheusMetrics = prometheusMetrics

        this.connection = null
        this.channel = null
        this.running = false
    }

    async connect() {
        this.logger.info(`Conectando a RabbitMQ en ${this.url}`)

        this.connection = await amqp.connect(this.url)
        this.channel = await this.connection.createConfirmChannel()

        if (this.exchange) {
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true })
        }

        if (this.queue) {
            await this.channel.assertQueue(this.queue, { durable: true })
        }

        this.running = true
    }

    async consume() {
        if (!this.channel || !this.running) throw new Error('No conectado')

        return await this.channel.consume(this.queue, async (msg) => {
            if (!msg) {
                this.logger.warn(`Mensaje vacío recibido en la queue "${this.queue}" - Payload "${msg}"`)
                return
            }

            let start
            const metricsEnabled = METRICS_ENABLED && !!this.prometheusMetrics

            if (metricsEnabled) start = process.hrtime.bigint()

            try {
                const payload = JSON.parse(msg.content.toString())
                await this.handler.handle(payload)

                if (metricsEnabled) {
                    const duration = Number(process.hrtime.bigint() - start) / 1e9
                    this.prometheusMetrics.recordSuccess(duration)
                }

                this.channel.ack(msg)
            } catch (err) {
                if (metricsEnabled) {
                    const duration = Number(process.hrtime.bigint() - start) / 1e9
                    this.prometheusMetrics.recordFailure(duration)
                }

                this.channel.nack(msg, false, false)
                this.logger.error(err)
            }
        })
    }

    async consume4() {
        if (!this.channel) throw new Error('No conectado')

        this.logger.info(`Consumiento desde "${this.queue}"`)
        this.consuming = true

        await this.channel.consume(this.queue, async (msg) => {
            if (!msg || !this.consuming) return

            try {
                const payload = JSON.parse(msg.content.toString())
                await this.handler?.handle(payload)
                this.channel.ack(msg)
            } catch (err) {
                this.logger.error(err)
                this.channel.nack(msg, false, false)
            }
        })
    }

    async sendToQueue(message) {
        if (!this.channel) throw new Error('No conectado')

        const buffer = Buffer.from(JSON.stringify(message))

        return new Promise((resolve, reject) => {
            this.channel.sendToQueue(this.queue, buffer, { persistent: true, timestamp: Date.now() }, (err, ok) => {
                if (err) {
                    this.logger.error(`Error al enviar mensaje a la queue "${this.queue}": ${err.message}`)
                    return reject(err)
                }

                this.logger.info(`Mensaje enviado a la queue "${this.queue}": ${JSON.stringify(message)}`)
                resolve(ok)
            })
        })
    }

    async publish(routingKey, message) {
        if (!this.channel) throw new Error('No conectado')

        const buffer = Buffer.from(JSON.stringify(message))
        this.channel.publish(this.exchange, routingKey, buffer, { persistent: true })
    }

    async stop() {
        this.running = false
        this.logger.info('Cerrando consumer...')

        if (this.channel) await this.channel.close()
        if (this.connection) await this.connection.close()

        this.logger.info('Consumer cerrado.')
    }
}
