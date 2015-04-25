#ConsoleControl
for Javascript

## Intro

- Enable or disable logs by calling `ConsoleControl.enable();`/`ConsoleControl.disable();`
- Record logs by calling `ConsoleControl.record(true);`
- To print the recorded logs use `ConsoleControl.print();`
- Recorded logs will be printed along with **file name and line number**.

## Installation

Just include ConsoleControl.js file in your page.

**Eg:**

```html
<script src="/js/ConsoleControl.js"></script>
```

And start using it.

## Code Example

**To enable or disable logs**

```javascript
console.log('1. WILL BE PRINTED');          // This will be printed

ConsoleControl.disable();                   // Disabling logs
console.log('2. WILL NOT BE PRINTED');      // This will NOT be printed

ConsoleControl.enable();                    // Enabling the logs back
console.log('3. WILL BE PRINTED');          // This will be printed
```

**To record logs**

```javascript
ConsoleControl.record(true);                // Enabling record logs
console.log('1. RECORDED');                 // This will be recorded

ConsoleControl.record(false);               // Disabling record logs
console.log('2. NOT RECORDED');             // This will NOT be recorded

ConsoleControl.print(); 	                // Prints the recorded log
```

**To disable logs and record**

```javascript
ConsoleControl.disable({record: true}); 	// Disabling logs and enabling the record logs
console.log('1. RECORDED');         		// This will be recorded
ConsoleControl.print(); 	        		// Prints the recorded log
```

## Doc
Methods  									| Description 													| Arguments 	|
------------- 								| ------------- 												| ---------  	|---------
```ConsoleControl.enable(<options>)```		| Enable logs 													| options 		| {record: <Boolean>}
```ConsoleControl.disable(<options>)``` 	| Disable logs 													| options 		| {record: <Boolean>}
```ConsoleControl.record(<recordFlag>)``` 	| Sets the record status 										| *recordFlag 	| <Boolean>
```ConsoleControl.print()```				| Prints the recorded logs along with file name and line number	| 				|
```ConsoleControl.logs()``` 				| Get the recorded logs as JSON 								| 				|
```ConsoleControl.eraseLogs()``` 			| Erases the recorded logs 										| 				|
```ConsoleControl.reset()``` 				| Resets the plugin 											| 				|
```ConsoleControl.version()```				| Returns the version of plugin									| 				|


## Motivation

- In production evironment, **no developer want to leak their logs** in browser console but still they **love to capture the logs** silently for debugging.
- This plugin will help developers to **stop printing the logs** in broswer console and to **record the logs silently**.

**Eg:**

```javascript
var environment = 'production';

if(environment === 'producation') {
	ConsoleControl.disable({record: true}); 	// Disabling logs and enabling the record logs
}
```

**And later if you need logs, you can get by...**
```javascript
ConsoleControl.print();                         // Prints the recorded log
```
**Or**
```javascript
ConsoleControl.logs();                          // Returns the recorded logs as JSON
```

## Contributors

- **Sundarasan Natarajan**