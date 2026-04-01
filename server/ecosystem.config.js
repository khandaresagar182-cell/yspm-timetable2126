module.exports = {
    apps: [{
        name: 'yspm-timetable-server',
        script: 'dist/index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        },
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_file: './logs/combined.log',
        time: true,
    }]
};
