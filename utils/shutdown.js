let isShuttingDown = false;

function setupShutdownHooks({ db, server }) {
    const shutdown = () => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        if (server && server.close) {
            server.close(() => {
                console.log('Server closed.');
            });
        }

        if (db && db.close) {
            try {
                db.close();
            } catch (err) {
                console.error('Error closing DB:', err.message);
            }
        }

        setTimeout(() => {
            console.log('Exit complete.');
            process.exit(0);
        }, 200);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('exit', shutdown);

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        shutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        shutdown();
    });
}

module.exports = setupShutdownHooks;
