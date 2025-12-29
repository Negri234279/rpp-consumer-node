import amqp from 'amqplib'

export class RabbitConsumer {
    constructor({ url, queue, logger, handler }) {
        this.url = url
        this.queue = queue
        this.logger = logger
        this.handler = handler

        this.connection = null
        this.channel = null
        this.running = false
    }

    async start() {
        this.logger.info(`Conectando a RabbitMQ en ${this.url}`)

        this.connection = await amqp.connect(this.url)
        this.channel = await this.connection.createChannel()

        await this.channel.assertQueue(this.queue, { durable: true })
        await this.channel.prefetch(1)

        this.running = true

        this.logger.info(`Escuchando "${this.queue}"`)

        this.channel.consume(this.queue, async (msg) => {
            if (!msg || !this.running) return

            try {
                const payload = JSON.parse(msg.content.toString())
                await this.handler.handle(payload)
                this.channel.ack(msg)
            } catch (err) {
                this.logger.error(err.message)
                this.channel.nack(msg, false, false)
            }
        })
    }

    async stop() {
        this.running = false
        this.logger.info('Cerrando consumer...')

        if (this.channel) await this.channel.close()
        if (this.connection) await this.connection.close()

        this.logger.info('Consumer cerrado.')
    }
}
