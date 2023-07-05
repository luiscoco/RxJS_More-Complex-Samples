import { Observable, Subject } from 'rxjs';

const subscriptionDelay = 2000;
const emissionDelay = 3000;

function ePromise() {
	const promise = new Promise((resolve, reject) => {
		console.log('executor function runs');
		// executor function will be executed immediately (Promise is eager), even if we don't 'use '.then' of 'await' on this promise (subscription is not necessary)
		// executor function will be executed only once (Promise is multicast)

		setTimeout(() => resolve('promise value'), 2000);
	});

	console.log('waiting...');

	// we subscribe after some amount of time in our examples to test how 'late' subscribers will do
	setTimeout(() => {
		promise.then((result) => console.log('promise result, then1:', result));
		promise.then((result) => console.log('promise result, then2:', result));
	}, subscriptionDelay);
}
// ePromise();

function eColdObservable() {
	const observable = new Observable((subscriber) => {
		console.log('subscribe callback runs');
		// will be executed only when observable.subscribe() is called (cold Observable is lazy),
		// will be executed for each .subscribe call (cold Observable is unicast)

		subscriber.next('observable value 1');
		setTimeout(() => {
			subscriber.next('observable value 2');
			subscriber.complete();
		}, emissionDelay);
	});

	console.log('waiting...');

	setTimeout(() => {
		observable.subscribe({
			next: (result) => console.log('observable value, s1:', result),
			complete: () => console.log('completed'),
		});

		observable.subscribe({
			next: (result) => console.log('observable value, s2:', result),
			complete: () => console.log('completed'),
		});
	}, subscriptionDelay);
}
// eColdObservable();

function eHotObservable() {
	const observable = new Subject();
	observable.next('observable value 1'); // this value is emitted immediately and won't be registered by late subscribers

	setTimeout(() => {
		observable.next('observable value 2');
		// this code is executed once, but both subscribers will be notified (multicast)
		observable.complete();
	}, emissionDelay);

	console.log('waiting...');

	setTimeout(() => {
		observable.subscribe({
			next: (result) => console.log('observable value, s1:', result),
			complete: () => console.log('completed'),
		});

		observable.subscribe({
			next: (result) => console.log('observable value, s2:', result),
			complete: () => console.log('completed'),
		});
	}, subscriptionDelay);
}

eHotObservable();

/* Differences:
promises: single value
observables: multiple values

promises: multicast
observables: unicast (cold), multicast (hot)

promises: eager
observables: lazy (cold), eager (hot)

promises: not cancelable
observables: cancelable with unsubscribe

promises: always asynchronous (then callback is added to microtask queue)
observables: maybe asyncronous or syncronous, depending on body of producer function (which calls next())

observables have operators!
*/

