const logger = require('./db/Logger');


( async () => {

    const usage = `

Usage:
node logs.js <argument>

Valid arguments are:
    - "errors" for all errors
    - "user <username>" for all entries related to a certain user
    - "page-loads" prints the amount of get-holiday request as
    an indicator of amount of page loads / visitors
`

    let logs;
    if (process.argv.length < 3) {
        console.error(usage);
        return;
    }
    else if (process.argv[2] === 'all')
        logs = await logger.getLogs();
    else if (process.argv[2] === 'errors')
        logs = await logger.getErrors();
    else if (process.argv[2] === 'user') {
        if (process.argv[3])
            logs = await logger.getUserLogs(process.argv[3]);
        else {
            console.error('\nNo username provided.\n\nUsage:\nnode logs.js user <username>\n');
            return;
        }
    }
    else if (process.argv[2] === 'page-loads') {
        logs = await logger.getLoads();
    }
    else {
        console.error('\nInvalid command-line arguments.', usage);
        return;
    }
    console.table(logs);
})()