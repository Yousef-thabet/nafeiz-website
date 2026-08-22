const { app, port } = require('./app');
const prisma = require('./config/db');

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
