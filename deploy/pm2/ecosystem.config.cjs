// Port 3001 : le :3000 du VPS est déjà pris par folioas-web
// Ne pas définir HOSTNAME ici (conflit Node / redirects Next → localhost)
module.exports = {
  apps: [
    {
      name: "dolci-front",
      cwd: "/opt/dolci-reva/dolci-reva-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3001",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
