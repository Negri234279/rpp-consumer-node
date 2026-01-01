import chalk from 'chalk'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { ILogger } from '../../application/ports/output/ILogger.js'
import { LOCALE, NODE_ENV, TZ } from '../config/config.js'

export class ConsoleLogger extends ILogger {
    constructor({ path: logPath }) {
        super()

        this.logPath = logPath
        this.errorLogPath = logPath.replace('.log', '-errors.log')

        fs.mkdirSync(path.dirname(logPath), { recursive: true })
    }

    #getFormattedTimestamp() {
        return new Date()
            .toLocaleString(LOCALE, {
                timeZone: TZ,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            })
            .replace(',', '')
    }

    success(msg) {
        this.#write(chalk.green, 'SUCCESS', msg)
    }

    info(msg) {
        this.#write(chalk.cyan, 'INFO', msg)
    }

    warn(msg) {
        this.#write(chalk.yellow, 'WARN', msg)
    }

    /**
     * @param {Error | Object | string} msg
     * @param {Error | Object | string} [err]
     */
    error(msg, err) {
        const errorId = this.#generateErrorId()

        if (msg instanceof Error) {
            err = msg
            msg = msg.message
        }

        this.#write(chalk.red, 'ERROR', `${msg} [${errorId}]`)

        if (err) {
            this.#writeErrorStack(errorId, msg, err)
        }
    }

    #write(colorFn, level, msg, err) {
        const msgFormatted = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)
        let line = `[${this.#getFormattedTimestamp()}] [${level}] ${msgFormatted}`

        if (err && NODE_ENV === 'development') {
            line += `\n${typeof err === 'string' ? err : err?.stack || JSON.stringify(err, null, 2)}`
        }

        console.log(colorFn(line))

        fs.appendFileSync(this.logPath, line + '\n')
    }

    #writeErrorStack(errorId, msg, err) {
        const timestamp = this.#getFormattedTimestamp()
        const separator = '='.repeat(80)
        const msgFormatted = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2)

        let errorDetails = `\n${separator}\n`
        errorDetails += `[${timestamp}] ERROR ID: ${errorId}\n`
        errorDetails += `Message: ${msgFormatted}\n`
        errorDetails += `${separator}\n`

        errorDetails += err instanceof Error ? `${err.stack}\n` : (errorDetails += `${JSON.stringify(err, null, 2)}\n`)

        if (err instanceof Error && err.cause) {
            errorDetails += `Cause: ${err.cause}\n${separator}\n`
        }

        fs.appendFileSync(this.errorLogPath, errorDetails)
    }

    #generateErrorId() {
        return `ERR-${crypto.randomUUID().toUpperCase()}`
    }
}
