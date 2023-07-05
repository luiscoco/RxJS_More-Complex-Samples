import { AsyncSubject, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

/*
An RxJS Subject is a special type of Observable that allows values to be multicasted to many Observers
in order to do this each subject maintains a list of its subscribers
*/

/*
Late subscribers receive:
Subject - only upcoming values
BehaviorSubject - one previous value and upcoming values
ReplaySubject - specified number of previous values (their number can be set) and upcoming values
AsyncSubject - latest number when stream will close (and after this, if there will be new subscribers)
*/

const subscriptionDelay = 2000;
const emissionDelay = 3000;

function eSubject() {
	const observable = new Subject();
	observable.next('observable value 1');
	observable.subscribe({
		next: (result) =>
			console.log('observable value, early subscriber:', result),
		complete: () => console.log('completed'),
	});

	observable.next('observable value 2'); // this value is emitted immediately and won't be registered by late subscribers

	setTimeout(() => {
		observable.next('observable value 3');
		// this code is executed once, but both subscribers will be notified (multicast)
		observable.complete();
	}, emissionDelay);

	console.log('waiting...');

	setTimeout(() => {
		console.log('late subscription registered');

		observable.subscribe({
			next: (result) =>
				console.log('observable value, late subscriber:', result),
			complete: () => console.log('completed'),
		});
	}, subscriptionDelay);
}
eSubject();

/*
Can be useful for fetching and caching (one-shot) resources, since generally http.get will emit one response then complete.
 */
function eAsyncSubject() {
	const observable = new AsyncSubject();
	observable.next('observable value 1');
	observable.next('observable value 2');
	setTimeout(() => {
		observable.next('observable value 3');
		observable.complete(); // emits only the latest value to all subscrivers just before the completion
	}, emissionDelay);

	console.log('waiting...');

	observable.subscribe({
		next: (result) =>
			console.log('observable value, early subscriber:', result),
		complete: () => console.log('completed'),
	});

	setTimeout(() => {
		console.log('late subscription registered');

		observable.subscribe({
			next: (result) =>
				console.log('observable value, late subscriber:', result),
			complete: () => console.log('completed'),
		});
	}, subscriptionDelay);
}
// eAsyncSubject();

function eBehaviorSubject() {
	const observable = new BehaviorSubject('observable value 1');
	// requires initial value
	// bad choice, if we don't have an initial value by the moment when we create the subject;
	// if we emit undefined, it will be mixed into the type and we'll need to run undefined checks
	observable.next('observable value 1'); // this value is emitted immediately and won't be registered by late subscribers
	observable.next('observable value 2'); // this value will be cached by subject and all the subscribers (including late) will receive it

	setTimeout(() => {
		observable.next('observable value 3');
		// this code is executed once, but both subscribers will be notified (multicast)
		observable.complete();
	}, emissionDelay);

	console.log('waiting...');

	observable.subscribe({
		next: (result) =>
			console.log('observable value, early subscriber:', result),
		complete: () => console.log('completed'),
	});

	setTimeout(() => {
		console.log('late subscription registered');

		observable.subscribe({
			next: (result) =>
				console.log('observable value, late subscriber:', result),
			complete: () => console.log('completed'),
		});
	}, subscriptionDelay);
}
// eBehaviorSubject();

function eReplaySubject() {
	const observable = new ReplaySubject(1);
	observable.next('observable value 1'); // this value is emitted immediately and won't be registered by late subscribers (unless we set the buffer > 1)
	observable.next('observable value 2'); // this value will be cached by subject and all the subscribers (including late) will receive it

	setTimeout(() => {
		observable.next('observable value 3');
		observable.complete();
	}, emissionDelay);

	console.log('waiting...');

	observable.subscribe({
		next: (result) => console.log('observable value, s1:', result),
		complete: () => console.log('completed'),
	});

	setTimeout(() => {
		observable.subscribe({
			next: (result) => console.log('observable value, s2:', result),
			complete: () => console.log('completed'),
		});
	}, subscriptionDelay);
}
// eReplaySubject();

