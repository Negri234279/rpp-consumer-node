export class IMessageHandler {
    /**
     * Process a message from the broker
     * @param {unknown} message - Message to process
     * @returns {Promise<void>}
     */
    async handle(message) {
        throw new Error('IMessageHandler.handle() not implemented')
    }
}
