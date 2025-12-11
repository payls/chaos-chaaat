module.exports = {
  apps: [
    {
      name: 'chaaat-workflows', // Replace with your application's name
      script: 'server.js',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        watch: false,
      },
      env_staging: {
        NODE_ENV: 'staging',
        watch: false,
      },
      // dev environment specific variables
      env_development: {
        NODE_ENV: 'development',
        args: '--inspect --trace-warnings', // Development-specific arguments
        ext: 'less,js,css,json,hbs', // Development-specific extensions to watch
        watch: true,
      },
      ignore_watch: ['node_modules', 'logs'], // Folders to ignore
      watch_options: {
        followSymlinks: false,
      },
      instances: Number(process.env.PM2_INSTANCES) || 2,
      exec_mode: 'cluster',
      restart_delay: 5000, // Add a delay between restarts
    },
  ],
};
