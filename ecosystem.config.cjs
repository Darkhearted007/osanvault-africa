// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "osanvault",
      script: "./backend/server.js",
      interpreter: "node",
      interpreter_args: "--experimental-modules",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
