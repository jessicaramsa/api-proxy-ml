module.exports = {
  apps : [{
    name: "api-proxy",
    script: './src/index.js',
    watch: '.',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
