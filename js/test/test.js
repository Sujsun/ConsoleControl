function consoleTest(prefix, limit) {
	printBorder();
	for(var index = 0; index < limit; index++) {
		console.log( prefix, ' -', index + 1 );
	}
	printBorder();
}

function printBorder() {
	console.log( '-----------------' );
}

function test() {
	console.error('Initially!');
	consoleTest('Initially', 5);

	ConsoleControl.disable();
	console.error('Disabling Console!');
	consoleTest('After disabling', 5);

	console.error('Enabling Console!');
	ConsoleControl.enable();
	consoleTest('After enabling', 5);

	console.error('Did not enable record, but still trying to print recorded logs.');
	ConsoleControl.print();

	console.error('Enabling Record!');
	ConsoleControl.record(true);
	consoleTest('This should be printed instantly and also should be recorded.', 5);

	console.error('Disabling Record!');
	ConsoleControl.record(false);
	consoleTest('After disabling record', 5);

	console.error('Printing the recorded logs.');
	ConsoleControl.print();

	ConsoleControl.disable();
	console.error('Disabling Console!');
	consoleTest('After disabling', 5);

	console.error('Enabling Record!');
	ConsoleControl.record(true);
	consoleTest('This should be not be printed instantly, but should be recorded.', 5);

	console.error('Disabling Record!');
	ConsoleControl.record(false);
	consoleTest('After disabling record', 5);

	console.error('Printing the recorded logs.');
	ConsoleControl.print();
}