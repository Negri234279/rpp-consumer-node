export class MessageBroker {
    isConnected = false
    connection = null
    channel = null
    /**
     * @type {string|null}
     */
    consumerTag = null

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
    constructor({
        url,
        queue = null,
        exchange = null,
        routingKey = '',
        messageConsumerHandler,
        logger,
        metricsRecorder = null,
    }) {
        this.url = url
        this.queue = queue
        this.exchange = exchange
        this.routingKey = routingKey
        this.metricsRecorder = metricsRecorder
        this.messageConsumerHandler = messageConsumerHandler
        this.logger = logger
    }

    /**
     * Connect to the message broker
     * @returns {Promise<void>}
     */
    async connect() {
        throw new Error('connect() debe ser implementado')
    }

    /**
     * Send a message (for point-to-point brokers)
     * @param {Object} message - Message to send
     * @param {Object} options - Broker-specific options
     */
    async send(message, options = {}) {
        throw new Error('Not implemented')
    }

    /**
     * Publish a message (for pub/sub brokers)
     * @param {Object} message - Message to publish
     * @param {Object} options - Options like routing key, headers, etc.
     */
    async publish(message, options = {}) {
        throw new Error('Not implemented')
    }

    /**
     * Start consuming messages
     * @returns {Promise<void>}
     */
    async consuming() {
        throw new Error('consuming() debe ser implementado')
    }

    /**
     * Stop the consumer
     * @returns {Promise<void>}
     */
    async stop() {
        throw new Error('stop() debe ser implementado')
    }

    /**
     * Check if the consumer is running
     * @returns {boolean}
     */
    isRunning() {
        return this.isConnected
    }
}
