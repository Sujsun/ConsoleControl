(function(root) {
    /**
     * Plugin Description
     */
    var plugin = {
        name: 'ConsoleControl',
        accessVariable: 'ConsoleControl',
        version: '0.0.1',
    };
    /**
     * Status Flags
     */
    var consoleBackup = {},
        isConsoleBackedUp = false,
        isConsoleEnabled = true,
        isConsoleWrapped = false,
        isRecordingEnabled = false,
        logs = [],
        consoleWrapperFunctions = {},
        isInitailized = false;
    /**
     * Logger methods to override
     */
    var methodsToOverride = ['log', 'info', 'debug', 'memory', 'error', ];
    /**
     * Presets for browsers
     * Please add the properties if we had missed to support your browser
     */
    var browsers = {
        'Chrome': {
            calleeStackIndex: 2,
            stackMatchRegex: ['[^(+]+\:[0-9]+\:[0-9]+[^)]', // From "at Object.InjectedScript.evaluate (<anonymous>:682:21)", pluck "(<anonymous>:682:21)" alone.
                '[^ +]+\:[0-9]+\:[0-9]+', // From "at https://www.google.com?_=1429679936851:3:1870", pluck "https://www.google.com?_=1429679936851:3:1870" alone.
            ],
        },
        'Firefox': {
            calleeStackIndex: 1,
            stackMatchRegex: ['[^@+]+\:[0-9]+\:[0-9]+', ],
        },
        'Safari': {
            calleeStackIndex: 1,
            stackMatchRegex: ['[^@+]+\:[0-9]+\:[0-9]+', ],
        }
    };
    /**
     * By default it takes the browser value as Chrome
     */
    var browser = browsers['Chrome'];
    /**
     * Identifies the browser
     * @return {undefined}
     */
    function _findBrowser() {
        var isLoopBroken = false;
        for (var key in browsers) {
            if (navigator.userAgent.indexOf(key) !== -1) {
                // console.info('Detected Browser as : ', key);
                browser = browsers[key];
                browser.name = key;
                isLoopBroken = true;
                break;
            }
        }
        if (!isLoopBroken) {
            console.error('ConsoleControl:: Couldn\'t find the browser type.');
        }
    }
    /**
     * Log Class
     * @param {String} 				Log level
     * @param {Object[Arguments]} 	Arguments object to print
     * @param {String} 				Has line number and file name from where the log is printed
     */
    function Log(level, arg, metaInfo) {
        this.level = level;
        this.arg = arg;
        this.metaInfo = metaInfo || '';
    }
    /**
     * Initializes the ConsoleControl plugin
     * @return {Boolean} Flag which says whether the plugin is initialized or not
     */
    function _initialize() {
        if (!isInitailized) {
            _findBrowser();
            _backup();
            _generateConsoleWrapperFunctions();
            isInitailized = true;
        }
        return isInitailized;
    }
    /**
     * Wraps the console methods with the wrapper function
     * @return {undefined}
     */
    function _wrapConsole(options) {
        options || (options = {});
        options.methodsToOverride || (options.methodsToOverride = methodsToOverride || []);
        if (!isConsoleWrapped || options.skipStatusCheck) {
            for (var index in options.methodsToOverride) {
                var methodName = options.methodsToOverride[index];
                root.console[methodName] = consoleWrapperFunctions[methodName];
            }
            isConsoleWrapped = true;
        }
    }
    /**
     * Unwraps the console methods/Removes the wrapper function from console methods
     * @return {undefined}
     */
    function _unWrapConsole(options) {
        options || (options = {});
        options.methodsToOverride || (options.methodsToOverride = methodsToOverride || []);
        if (isConsoleWrapped || options.skipStatusCheck) {
            for (var index in options.methodsToOverride) {
                var methodName = options.methodsToOverride[index];
                root.console[methodName] = consoleBackup[methodName];
            }
            isConsoleWrapped = false;
        }
    }
    /**
     * Generates console method wrapper functions and equates it to consoleWrapperFunctions variable
     * @return {undefined}
     */
    function _generateConsoleWrapperFunctions() {
        for (var index in methodsToOverride) {
            var methodName = methodsToOverride[index];
            consoleWrapperFunctions[methodName] = new Console(methodName);
        }
    }
    /**
     * Decides whether to wrap or unwrap the console methods
     * @param  {Object} 		options = { methodsToOverride: ['log',..], skipStatusCheck: true, }
     * @return {undefined}
     */
    function _decideWrapConsole(options) {
        if (isConsoleEnabled && !isRecordingEnabled) {
            _unWrapConsole(options);
        } else {
            _wrapConsole(options);
        }
    }
    /**
     * Console Class
     * @param {String} 		Log level
     * @return {Function} 	Return function which will be assigned to console methods
     */
    function Console(level) {
        return function() {
            var error = new Error('Error to find the file and line number.');
            var metaInfo = getMetaInfo(error, browser);
            if (isConsoleEnabled) {
                _logger(level, arguments, {
                    error: error,
                    metaInfo: metaInfo,
                });
            }
            if (isRecordingEnabled) {
                _record(level, arguments, {
                    error: error,
                    metaInfo: metaInfo,
                });
            }
        };
    }
    /**
     * Takes a backup of console methods
     * @return {Boolean}	Flag which says whether the console is backed up or not
     */
    function _backup() {
        if (!isConsoleBackedUp) {
            for (var index in methodsToOverride) {
                var methodName = methodsToOverride[index];
                consoleBackup[methodName] = root.console[methodName];
            }
            isBackedUp = true;
        }
        return isConsoleBackedUp;
    }
    /**
     * Erases the backup of console methods
     * @return {Boolean} 	Flag which says whether the console is backed up or not
     */
    function eraseBackup() {
        if (isConsoleBackedUp) {
            consoleBackup = {};
            isConsoleBackedUp = false;
        }
        return !isConsoleBackedUp;
    }
    /**
     * Get recorded logs
     * @return {Array[Log]} 	Array of log objects
     */
    function getLogs() {
        return logs;
    }
    /**
     * Erases the recorded logs
     * @return {Array[Log]} 	Array of log objects
     */
    function eraseLogs() {
        logs = [];
        return logs;
    }
    /**
     * Method to enable or disable log recording feature
     * @param  {Boolean} 	Flag which says whether to enable or disable the log recording feature
     * @return {Boolean}	Flag which says whether to log record feature is enabled or disabled
     */
    function _recordStatus(isRecordingEnabledArg) {
        if (typeof(isRecordingEnabledArg) === 'boolean') {
            isRecordingEnabled = isRecordingEnabledArg;
        }
        return isRecordingEnabled;
    }
    /**
     * Record Class
     * @param {undefined}
     */
    function Record(level) {
        return function() {
            _record(level, arguments);
        };
    }
    /**
     * Records the given log details
     * @param  {String} 			Log level (Eg.: 'log', 'error', 'info', 'debug')
     * @param  {Object[Arguments]} 	Arguements with which the log method is invoked
     * @param  {Object} 			options = {metaInfo: '(test.js:10:2)'}
     * @return {Object[Log]} 		Returns the constructed Log object
     */
    function _record(level, argumentsArg, options) {
        level || ((function() {
            throw new Error('Please provide log level.');
        })());
        var log = new Log(level, argumentsArg, options.metaInfo);
        logs.push(log);
        return log;
    }
    /**
     * Prints the recorded logs
     * @return {undefined}
     */
    function printLogs() {
        for (var index in logs) {
            var log = logs[index];
            _logger(log.level, log.arg, {
                metaInfo: log.metaInfo,
            });
        }
    }
    /**
     * Method to enable/disable the console status
     * @param  {Boolean} 	Flag which tell whether to enable or disable logs
     * @return {Boolean}	Flag which tell whether logs are enabled or disabled
     */
    function _consoleStatus(isConsoleEnabledArg) {
        if (typeof(isConsoleEnabledArg) === 'boolean') {
            isConsoleEnabled = isConsoleEnabledArg;
        }
        return isConsoleEnabled;
    }
    /**
     * Helper function to pring logs with n number of arguments
     * @param  {String}  			String which says the log level as String
     * @param  {Object[Arguments]} 	Arguments object with which the log method was invoked
     * @param  {Object} 			options = {metaInfo: '(test.js:10:2)'}
     * @return {undefined}
     */
    function _logger(level, argumentsArg, options) {
        argumentsArg = Array.prototype.slice.call(argumentsArg);
        if (options.metaInfo) {
            argumentsArg.push('\t' + options.metaInfo)
        }
        var i = -1,
            args = [],
            l = argumentsArg.length,
            fn = 'console.' + (level || 'log') + '(args)';
        while (++i < l) {
            args.push('args[' + i + ']');
        };
        fn = new Function('args', fn.replace(/args/, args.join(',')));
        root.console[level] = consoleBackup[level];
        fn(argumentsArg);
        _decideWrapConsole({
            methodsToOverride: [level],
            skipStatusCheck: true,
        });
    }
    /**
     * Get the metaInfo (i.e line number & file) from the given Error object
     * @param  {Object[Error]} 	Error object with which the line number/file should be found
     * @param  {Object} 		options = {calleeStackIndex: 2, stackMatchRegex: ['[^@+]+\:[0-9]+\:[0-9]+', ],}
     * @return {String} 		metaInfo String (Eg.: '(test.js:10:1)')
     */
    function getMetaInfo(error, options) {
        options || (options = {});
        options.calleeStackIndex || ((function() {
            throw new Error('Please provide calleeStackIndex in options.');
        })());
        options.stackMatchRegex || ((function() {
            throw new Error('Please provide stackMatchRegex in options.');
        })());
        var callerFunctionLine = error.stack.split("\n")[options.calleeStackIndex];
        for (var index in options.stackMatchRegex) {
            var stackMatchRegex = options.stackMatchRegex[index];
            var matches = callerFunctionLine.match(new RegExp(stackMatchRegex, 'g'));
            if (matches && matches.length) {
                return '(' + matches[0] + ')';
            }
        }
    }
    /**
     * Function to control all the status
     * @param  {Object} 	options = {console: true, record: true}
     * @return {Boolean} 	true
     */
    function status(options) {
        options || (options = {});
        _consoleStatus(options.console);
        _recordStatus(options.record);
        _decideWrapConsole();
        return true;
    }
    /**
     * Enables printing logs
     * @return {Boolean} 	true
     */
    function enable(options) {
        options || (options = {});
        options.console = true;
        return status(options);
    }
    /**
     * Disables printing logs
     * @return {Boolean} 	true
     */
    function disable(options) {
        options || (options = {});
        options.console = false;
        return status(options);
    }
    /**
     * Control the record status alone
     * @param  {Boolean} 	Flag which says whether to record or not
     * @return {Boolean} 	true
     */
    function record(recordFlag) {
        var options = {
            record: recordFlag,
        };
        return status(options);
    }
    /**
     * Gets plugin version
     * @return {String} 	Version of the plugin
     */
    function version() {
        return plugin.version;
    }
    /**
     * Initializing
     */
    _initialize();
    /**
     * Members to Export
     */
    var exports = {
        print: printLogs,
        logs: getLogs,
        eraseLogs: eraseLogs,
        status: status,
        reset: _unWrapConsole,
        enable: enable,
        disable: disable,
        record: record,
        version: version,
    };
    /**
     * Exporing
     */
    root[plugin.accessVariable] = exports
})(this);