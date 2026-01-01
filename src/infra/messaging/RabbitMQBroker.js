import amqp from 'amqplib'

import { MessageBroker } from './MessageBroker.js'

export class RabbitMQBroker extends MessageBroker {
    /**
     * @type {import('amqplib').ChannelModel}
     */
    connection = null
    /**
     * @type {import('amqplib').ConfirmChannel}
     */
    channel = null

    /**
     * @param {Object} config
     * @param {string} config.url
     * @param {string|null} config.queue
     * @param {string|null} config.exchange
     * @param {string|null} config.routingKey
     * @param {import('../../application/ports/input/IMessageHandler.js').IMessageHandler} config.messageConsumerHandler
     * @param {import('../../application/ports/output/ILogger.js').ILogger} config.logger
     * @param {import('../../application/ports/output/IMetricsRecorder.js').IMetricsRecorder} config.metricsRecorder
     */
    constructor(config) {
        super(config)
    }

    async connect() {
        try {
            this.logger.info(`Connecting to RabbitMQ at ${this.url}`)

            this.connection = await amqp.connect(this.url)
            this.channel = await this.connection.createConfirmChannel()

            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error:', err)
                this.isConnected = false
            })

            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed')
                this.isConnected = false
            })

            if (this.exchange) {
                await this.channel.assertExchange(this.exchange, 'topic', {
                    durable: true,
                })
            }

            if (this.queue) {
                await this.channel.assertQueue(this.queue, {
                    durable: true,
                })

                if (this.exchange) {
                    await this.channel.bindQueue(this.queue, this.exchange, '*')
                }
            }

            this.isConnected = true

            this.logger.info(`Connected to RabbitMQ - Queue: ${this.queue}`)
        } catch (error) {
            this.logger.error('Error connecting to RabbitMQ:', error)
            throw error
        }
    }

    /**
     * Send a message (for point-to-point brokers)
     * @param {Object} message
     * @param {import('amqplib').Options.Publish} options
     * @returns
     */
    async send(message, options = {}) {
        if (!this.channel || !this.isConnected) {
            throw new Error('Not connected to RabbitMQ')
        }

        const buffer = Buffer.from(JSON.stringify(message))

        return new Promise((resolve, reject) => {
            this.channel.sendToQueue(
                this.queue,
                buffer,
                { ...options, persistent: true, timestamp: Date.now() },
                (err, ok) => {
                    if (err) {
                        this.logger.error(`Error sending message: ${err.message}`, err)
                        return reject(err)
                    }

                    this.logger.info(`Message sent to queue "${this.queue}"`)

                    resolve(ok)
                },
            )
        })
    }

    /**
     * Publish a message (for pub/sub brokers)
     * @param {Object} message - Message to publish
     * @param {import('amqplib').Options.Publish} options - Options like routing key, headers, etc.
     */
    async publish(message, options = {}) {
        if (!this.channel || !this.isConnected) {
            throw new Error('Not connected to RabbitMQ')
        }

        const buffer = Buffer.from(JSON.stringify(message))

        this.channel.publish(this.exchange, options.routingKey, buffer, {
            ...options,
            persistent: true,
            timestamp: Date.now(),
        })

        this.logger.info(`Message published to exchange "${this.exchange}" with routing key "${options.routingKey}"`)
    }

    async consuming() {
        if (!this.channel || !this.isConnected) {
            throw new Error('Not connected to RabbitMQ. Call connect() first.')
        }

        try {
            const { consumerTag } = await this.channel.consume(
                this.queue,
                async (msg) => await this._handleMessage(msg),
                { noAck: false },
            )

            this.consumerTag = consumerTag

            this.logger.info(`Consuming messages from queue "${this.queue}"`)
        } catch (error) {
            this.logger.error('Error starting consumption:', error)
            throw error
        }
    }

    async _handleMessage(msg) {
        if (!msg) {
            this.logger.warn(`Null message received in queue "${this.queue}"`)
            return
        }

        const startTime = this.metricsRecorder ? process.hrtime.bigint() : null

        try {
            const payload = JSON.parse(msg.content.toString())

            await this.messageConsumerHandler.handle(payload)

            if (this.metricsRecorder && startTime) {
                const duration = Number(process.hrtime.bigint() - startTime) / 1e9
                this.metricsRecorder.recordSuccess(duration)
            }

            this.channel.ack(msg)
        } catch (error) {
            this.logger.error('Error processing message:', error)

            if (this.metricsRecorder && startTime) {
                const duration = Number(process.hrtime.bigint() - startTime) / 1e9
                this.metricsRecorder.recordFailure(duration)
            }

            this.channel.nack(msg, false, false)
        }
    }

    async stop() {
        this.isConnected = false

        try {
            this.logger.warn('Closing RabbitMQ consumer...')

            if (this.consumerTag && this.channel) {
                await this.channel.cancel(this.consumerTag)
            }

            if (this.channel) {
                await this.channel.close()
            }

            if (this.connection) {
                await this.connection.close()
            }

            this.logger.success('RabbitMQ consumer closed successfully')
        } catch (error) {
            this.logger.error('Error closing consumer:', error)
            throw error
        }
    }
}
