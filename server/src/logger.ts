import morgan from 'morgan';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    info(message: string, ...args: any[]) {
        if (!this.isProduction) {
            console.log(`[INFO] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: any[]) {
        console.warn(`[WARN] ${message}`, ...args);
    }

    error(message: string, ...args: any[]) {
        console.error(`[ERROR] ${message}`, ...args);
    }

    debug(message: string, ...args: any[]) {
        if (!this.isProduction) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }

    // HTTP request logger middleware for Express
    getHttpLogger() {
        if (this.isProduction) {
            // In production, use combined format (Apache style)
            return morgan('combined');
        } else {
            // In development, use dev format (colored output)
            return morgan('dev');
        }
    }
}

export const logger = new Logger();
