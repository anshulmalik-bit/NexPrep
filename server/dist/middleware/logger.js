export function requestLogger(req, res, next) {
    const start = Date.now();
    const { method, url } = req;
    // Hook into response finish to log duration and status
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const color = status >= 500 ? '\x1b[31m' // Red
            : status >= 400 ? '\x1b[33m' // Yellow
                : status >= 300 ? '\x1b[36m' // Cyan
                    : '\x1b[32m'; // Green
        const reset = '\x1b[0m';
        console.log(`[${new Date().toISOString()}] ${method} ${url} ${color}${status}${reset} - ${duration}ms`);
    });
    next();
}
