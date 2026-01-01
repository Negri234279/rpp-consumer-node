export class ILogger {
    /**
     * @param {string} message
     */
    success(message) {
        throw new Error('ILogger.success() not implemented')
    }

    /**
     * @param {string} messager
     */
    info(message) {
        throw new Error('ILogger.info() not implemented')
    }

    /**
     * @param {string} message
     */
    warn(message) {
        throw new Error('ILogger.warn() not implemented')
    }

    /**
     * @param {Error|Object|string} message
     * @param {Error|Object|string} [error]
     */
    error(message, error) {
        throw new Error('ILogger.error() not implemented')
    }
}
