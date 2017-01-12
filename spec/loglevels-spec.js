describe("Logging level config tests", function() {
    var logging = require('../index');

    it("default log level", function() {
        // Logging level not configured should default it to ERROR
        const logger = logging.logger('a.b.c');
        expect(logger.logLevel).toBe(logging.Level.ERROR);
    });

    it("explicit log level", function() {
        // Set the logging level for the category.
        logging.setLogLevel('a.b.c', logging.Level.DEBUG);

        const logger = logging.logger('a.b.c');
        expect(logger.logLevel).toBe(logging.Level.DEBUG);
    });

    it("inherited log level", function() {
        // Set the logging level for different "parent" categories.
        logging.setLogLevel('a', logging.Level.WARN);
        logging.setLogLevel('a.b', logging.Level.INFO);
        logging.setLogLevel('a.b.c', logging.Level.DEBUG);

        expect(logging.logger('a.b.c').logLevel).toBe(logging.Level.DEBUG); // from 'a.b.c'
        expect(logging.logger('a.b.d').logLevel).toBe(logging.Level.INFO); // from 'a.b'
        expect(logging.logger('a.x.a').logLevel).toBe(logging.Level.WARN); // from 'a'
    });

    it("inherited log level", function() {
        // Set the logging level for different "parent" categories.
        logging.setLogLevel('a', logging.Level.WARN);
        logging.setLogLevel('a.b', logging.Level.INFO);
        logging.setLogLevel('a.b.c', logging.Level.DEBUG);

        const abc = logging.logger('a.b.c');
        const abd = logging.logger('a.b.d');
        const axa = logging.logger('a.x.a');

        expect(abc.isDebugEnabled()).toBe(true);
        expect(abc.isEnabled(logging.Level.DEBUG)).toBe(true);
        expect(abc.isEnabled(logging.Level.INFO)).toBe(true);
        expect(abc.isEnabled(logging.Level.WARN)).toBe(true);
        expect(abc.isEnabled(logging.Level.ERROR)).toBe(true);

        expect(abd.isDebugEnabled()).toBe(false);
        expect(abd.isEnabled(logging.Level.DEBUG)).toBe(false);
        expect(abd.isEnabled(logging.Level.INFO)).toBe(true);
        expect(abd.isEnabled(logging.Level.WARN)).toBe(true);
        expect(abd.isEnabled(logging.Level.ERROR)).toBe(true);

        expect(axa.isDebugEnabled()).toBe(false);
        expect(axa.isEnabled(logging.Level.DEBUG)).toBe(false);
        expect(axa.isEnabled(logging.Level.INFO)).toBe(false);
        expect(axa.isEnabled(logging.Level.WARN)).toBe(true);
        expect(axa.isEnabled(logging.Level.ERROR)).toBe(true);
    });

    it("logging", function() {
        // Set the logging level for different "parent" categories.
        logging.setLogLevel('a', logging.Level.WARN);
        logging.setLogLevel('a.b', logging.Level.INFO);
        logging.setLogLevel('a.b.c', logging.Level.DEBUG);

        const abc = logging.logger('a.b.c');
        const abd = logging.logger('a.b.d');
        const axa = logging.logger('a.x.a');
        const zzz = logging.logger('z.z.z'); // nothing set for this. see above
        var mockConsole;

        // everything should get logged to the "abc" logger
        mockConsole = newMockConsole();
        abc.debug('message');
        abc.info('message');
        abc.warn('message');
        abc.error('message');
        expect(mockConsole.logs.length).toBe(4);
        expect(mockConsole.logs[0].level).toBe('debug');
        expect(mockConsole.logs[1].level).toBe('log');
        expect(mockConsole.logs[2].level).toBe('warn');
        expect(mockConsole.logs[3].level).toBe('error');

        // info, warn and error only for the "abd" logger
        mockConsole = newMockConsole();
        abd.debug('message');
        abd.info('message');
        abd.warn('message');
        abd.error('message');
        expect(mockConsole.logs.length).toBe(3);
        expect(mockConsole.logs[0].level).toBe('log');
        expect(mockConsole.logs[1].level).toBe('warn');
        expect(mockConsole.logs[2].level).toBe('error');

        // warn and error only for the "axa" logger
        mockConsole = newMockConsole();
        axa.debug('message');
        axa.info('message');
        axa.warn('message');
        axa.error('message');
        expect(mockConsole.logs.length).toBe(2);
        expect(mockConsole.logs[0].level).toBe('warn');
        expect(mockConsole.logs[1].level).toBe('error');

        // error only for the "zzz" logger
        mockConsole = newMockConsole();
        zzz.debug('message');
        zzz.info('message');
        zzz.warn('message');
        zzz.error('message');
        expect(mockConsole.logs.length).toBe(1);
        expect(mockConsole.logs[0].level).toBe('error');
    });
});

function newMockConsole() {
    const mockConsole = {
        logs: [],
        debug: function () {
            mockConsole.logs.push({level: 'debug', arguments: arguments});
        },
        log: function () {
            mockConsole.logs.push({level: 'log', arguments: arguments});
        },
        warn: function () {
            mockConsole.logs.push({level: 'warn', arguments: arguments});
        },
        error: function () {
            mockConsole.logs.push({level: 'error', arguments: arguments});
        }
    };
    console.debug = mockConsole.debug;
    console.log = mockConsole.log;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
    return mockConsole;
}