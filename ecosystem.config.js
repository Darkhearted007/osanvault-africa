module.exports = {
  apps: [
    {
      name: 'osanvault-api',
      script: 'dist/index.js',
      cwd: './apps/api',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      kill_timeout: 3000,
      listen_timeout: 8000,
      shutdown_timeout: 7000,
      instance_var: 'INSTANCE_ID',
      instance_prefix: 'osanvault-api',
      exec_interpreter: 'node',
      cron_restart: '0 3 * * *',
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],
  plugins: [],
  prelude: []
};