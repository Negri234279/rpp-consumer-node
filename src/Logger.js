import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'

export class Logger {
    constructor(logPath) {
        this.logPath = logPath
        fs.mkdirSync(path.dirname(logPath), { recursive: true })
    }

    success(msg) {
        this._write(chalk.green, 'SUCCESS', msg)
    }

    info(msg) {
        this._write(chalk.cyan, 'INFO', msg)
    }

    error(msg) {
        this._write(chalk.red, 'ERROR', msg)
    }

    warn(msg) {
        this._write(chalk.yellow, 'WARN', msg)
    }

    _write(colorFn, level, msg) {
        const line = `[${new Date().toISOString()}] [${level}] ${msg}`
        console.log(colorFn(line))

        fs.appendFileSync(this.logPath, line + '\n')
    }
}
