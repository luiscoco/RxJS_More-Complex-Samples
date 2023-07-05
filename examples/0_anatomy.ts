import { Observable } from 'rxjs';

// const promise = new Promise((res, rej) => {
// 	setTimeout(() => res('hello'), 2000);
// });

// promise.then((value) => {
// 	console.log('fireworks!');
// });

//  ~ no rxjs
function noRxjsExample() {
	function subscribeFn(subscriber) {
		// some process asyncronously produces the values...
		const intervalId = setInterval(() => {
			subscriber.next('tick'); // to notify external code, we 'push' the value by calling .next method, that external code provided us in advance
		}, 1000);

		return function unsubscribe() {
			clearInterval(intervalId);
		};
	}

	const unsubscribe = subscribeFn({ next: (x) => console.log(x) }); // we call 'subscribe' to start receiveing values
	// Later:
	setTimeout(() => unsubscribe(), 5000); // dispose the resources
}

noRxjsExample();

// so, we can do it without a library, but using a library allows for strong typization of this pattern
// ~ subscribe
function subscribeExample() {
	// with library we have an Obervable class wrapper that handles the necessary data

	/* we can manually create an Observable like this: */
	// here we diractly pass a function that will be executed upon subscription (when we call 'subscribe' method of obervable)
	const observable = new Observable(function subscribeCallback() {
		setInterval(() => {
			console.log('tick');
		}, 1000);
	});

	debugger;
	
	/* to activate the Observable, observer has to subscribe to it using `.subscribe` method on Observable
	otherwise it won't be executed at all */
	observable.subscribe();
	// in this form it's really just a callback,
	// and it is not flexible enough because once we created Observable, we cannot so much more upon subsription rather then call our callback.
}
subscribeExample();

// ~ unsubscribe
function unsubscribeExample() {
	const observable = new Observable(function subscribeCallback() {
		const intervalId = setInterval(() => {
			console.log('tick');
		}, 1000);

		// subscribe can return a function, that we'll be able to save and call when we want to unsubscribe from observable (by calling .unsubscribe())
		return function unsubscribe() {
			console.log('unsubscribing...');
			clearInterval(intervalId);
		};
	});

	debugger;

	const subscription = observable.subscribe();
	setTimeout(() => subscription.unsubscribe(), 5000); // will unsubscribe after 5 ticks

	// In your code it is important to call the "unsubscribe" when you no longer need the subscription, this prevents problems with memory leaks

}
// unsubscribeExample();

// ~ observer aka subscriber
function observerExample() {
	/*
	for improved flexibility, we can make it better by adding an argument to our callback
	this argument is called 'observer' or 'subscriber'
	*/
	const observable = new Observable(function subscribeCallback(subscriber) {
		const intervalId = setInterval(() => {
			subscriber.next(Date.now());
		}, 1000);
	});

	// observer is an object with several methods that use can call within subscribe function
	observable.subscribe({
		next: (result) => {
			console.log('subscribe in object form', result);
		},
	});

	// if a function is passed that overload is considered a .next() method of subscriber
	observable.subscribe((result) => {
		console.log('subscriber as a "next" function', result);
	});

		/* now in our subscription we are able to get the result from subscribe callback and do something in subscriber function */
}
// observerExample();

function multipleSubscriptionsExample() {
	// ^ if there are multiple subscriptions, subscribeCallback function will be called for each of them
	const observable = new Observable(function subscribeCallback(subscriber) {
		console.log('subscribe callback is executed');
		debugger;
		subscriber.next(Date.now());
	});

	observable.subscribe((result) => {
		console.log(1, result);
	});

	observable.subscribe((result) => {
		console.log(2, result);
	});
	/* Each call to observable.subscribe triggers its own independent setup for that given subscriber. */
}
// multipleSubscriptionsExample()

// So, Rxjs is a formalization of observer pattern, and Observable class serves as a contract that everyone can follow
// this allows to write rxjs operators that follow this contract when transforming the data, and this ensures composability of this operators, that we will see further

// ~ other methods of observer
function observerMethodsExample() {
	const observable = new Observable(function subscribeCallback(subscriber) {
		setInterval(() => {
			subscriber.next(Date.now());
		}, 1000);

		setTimeout(() => {
			subscriber.error('errored out');
		}, 3000);

		setTimeout(() => subscriber.complete(), 4000); // we need complete so that observer can know that there will be no more notifications and react accordingly
		// if we call complete, next and error callback will stop receiving the notification;
		// if we call error, next and complete  callback will stop receiving the notification;
		// this means we can observable can be either completed or errored, but not both at the same time
	});

	observable.subscribe({
		next: (result) => {
			console.log('next callback', result);
		},
		error: (error) => {
			console.log('error callback', error);
		},
		complete: () => {
			console.log('completed');
		},
	});
}
// observerMethodsExample();
