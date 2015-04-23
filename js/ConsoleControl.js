(function(root) {
	var consoleBackup = {};
	var isConsoleBackedUp = false;
	var isConsoleEnabled = true;
	var isRecordingEnabled = false;
	var isConsoleWrapped = false;
	var logs = [];
	var methodsToOverride = ['log', 'info', 'debug', 'memory',];
	var consoleWrapperFunctions = {};
	var isInitailized = false;
	var browsers = {
		'Chrome': {
			calleeStackIndex: 2,
			stackMatchRegex: [
				'[^(+]+\:[0-9]+\:[0-9]+[^)]', // From "at Object.InjectedScript.evaluate (<anonymous>:682:21)", pluck "(<anonymous>:682:21)" alone.
				'[^ +]+\:[0-9]+\:[0-9]+', // From "at https://www.google.com?_=1429679936851:3:1870", pluck "https://www.google.com?_=1429679936851:3:1870" alone.
			],
		},
		'Firefox': {
			calleeStackIndex: 1,
			stackMatchRegex: [
				'[^@+]+\:[0-9]+\:[0-9]+',
			],
		},
		'Safari': {
			calleeStackIndex: 1,
			stackMatchRegex: [
				'[^@+]+\:[0-9]+\:[0-9]+',
			],
		}
	};
	var browser = {name: 'Chrome', calleeStackIndex: 2,};

	function _findBrowser() {
		var isLoopBroken = false;
		for(var key in browsers) {
			if(navigator.userAgent.indexOf(key) !== -1) {
				// console.info('Detected Browser as : ', key);
				browser = browsers[key];
				browser.name = key;
				isLoopBroken = true;
				break;
			}
		}
		if(!isLoopBroken) {
			console.error('ConsoleControl:: Couldn\'t find the browser type.');
		}
	}

	function Log(level, arg, metaInfo) {
		this.level = level;
		this.arg = arg;
		this.metaInfo = metaInfo || '';
	}

	function _initialize() {
		if(!isInitailized) {
			_findBrowser();
			window.brow = browser;
			_backup();
			_generateConsoleWrapperFunctions();
			_wrapConsole();
			isInitailized = true;
		}
		return isInitailized;
	}

	function _wrapConsole() {
		if(!isConsoleWrapped) {
			for(var index in methodsToOverride) {
				var methodName = methodsToOverride[index];
				root.console[methodName] = consoleWrapperFunctions[methodName];
			}
		}
	}

	function _unWrapConsole() {
		if(isConsoleWrapped) {
			for(var index in methodsToOverride) {
				var methodName = methodsToOverride[index];
				root.console[methodName] = consoleBackup[methodName];
			}
			isConsoleWrapped = false;
		}
	}

	function _generateConsoleWrapperFunctions() {
		for(var index in methodsToOverride) {
			var methodName = methodsToOverride[index];
			consoleWrapperFunctions[methodName] = new Console(methodName);
		}
	}

	function Console(level) {
		return function() {
			var error = new Error('Error to find the file and line number.');
			var metaInfo = getMetaInfo(error, browser.calleeStackIndex);
			if(isConsoleEnabled) {
				_logger(level, arguments, { error: error, metaInfo: metaInfo, });
			}
			if(isRecordingEnabled) {
				_record(level, arguments, { error: error, metaInfo: metaInfo, });	
			}
		};
	}

	function _backup() {
		if(!isConsoleBackedUp) {
			for(var index in methodsToOverride) {
				var methodName = methodsToOverride[index];
				consoleBackup[methodName] = root.console[methodName];
			}
			isBackedUp = true;
		}
		return isConsoleBackedUp;
	}

	function eraseBackup() {
		if(isConsoleBackedUp) {
			consoleBackup = {};
			isConsoleBackedUp = false;
		}
		return !isConsoleBackedUp;
	}

	function eraseLogs() {
		logs = [];
	}

	function getLogs() {
		return logs;
	}

	function record(isRecordingEnabledArg) {
		if(typeof(isRecordingEnabledArg) === 'boolean') {
			isRecordingEnabled = isRecordingEnabledArg;
		}
		return isRecordingEnabled;
	}

	function Record(level) {
		return function() {
			_record(level, arguments);
		};
	}

	function _record(level, argumentsArg, options) {
		level || ((function() {throw new Error('Please provide log level.');})());
		logs.push(new Log(level, argumentsArg, options.metaInfo));
		return logs;
	}

	function printLogs() {
		for(var index in logs) {
			var log = logs[index];
			_logger(log.level, log.arg, { metaInfo: log.metaInfo, });
		}	
	}

	function status(isConsoleEnabledArg) {
		if(typeof(isConsoleEnabledArg) === 'boolean') {
			isConsoleEnabled = isConsoleEnabledArg;
		}
		return isConsoleEnabled;
	}

	function _logger(level, argumentsArg, options) {
		if(options.metaInfo) {
			argumentsArg[argumentsArg.length] = '\t' + options.metaInfo;
			argumentsArg.length = argumentsArg.length + 1;
		}
		var l = argumentsArg.length;
	    var i = -1, args = [], fn = 'console.' + (level || 'log') + '(args)';
	    while(++i<l){
	        args.push('args['+i+']');
	    };
	    fn = new Function('args',fn.replace(/args/,args.join(',')));
	    root.console[level] = consoleBackup[level];
	    fn(argumentsArg);
	    root.console[level] = consoleWrapperFunctions[level];
	}

	function getMetaInfo(error, stackIndex) {
		var callerFunctionLine = error.stack.split("\n")[stackIndex];
		for(var index in browser.stackMatchRegex) {
			var stackMatchRegex = browser.stackMatchRegex[index];
			var matches = callerFunctionLine.match(new RegExp(stackMatchRegex, 'g'));
			if(matches && matches.length) {
				return '(' + matches[0] + ')';
			}
		}
	}

	function enable() {
		return status(true);
	}

	function disable() {
		return status(false);
	}

	_initialize();

	root.ConsoleControl = { consoleBackup: consoleBackup, print: printLogs, logs: getLogs, eraseLogs: eraseLogs, record: record, status: status, reset: _unWrapConsole, enable: enable, disable: disable, };

})(this);