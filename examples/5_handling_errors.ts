import {
	Observable,
	catchError,
	finalize,
	map,
	of,
	onErrorResumeNext,
	range,
	retry,
	throwError,
} from 'rxjs';

const errorObservable$ = new Observable(function subscribeCallback(subscriber) {
	subscriber.next('foo');
	subscriber.error(new Error('errored out'));
});


// a common subscriber object that we will use in all examples, just logs the values:
const subscriber = {
	next(result) {
		console.log(result);
	},
	error(err) {
		console.log(err);
	},
	complete() {
		console.log('completed');
	},
};

// # throwing an error

// a common case is when you need to throw an error e.g. inside map operator
function eThrow() {
	range(1, 5)
		.pipe(
			map((value) => {
				if (value > 3) throw new Error('wrong!'); // RxJS will catch the error and wrap it into Observable
								console.log(value);

				// you shouldn't do something like `of(error)`, because in this case you will throw the error in the normal (next) stream

				return value;
			})
		)
		.subscribe(subscriber);
}
// eThrow();

// ~ throwError operator
{
	
	// if we have not an operator, but some function, that should return an observable
	// and we want to keep return type consistent (it should be an Observable no matter what )
	function ethrowError() {
		function getUrl$(value) {
			const url = `https://someUrl/${value}`;
			if (value < 4) {
				return of(url); // could be something like return fetch(url);
			} else {
				// using throwError we ensure that observable will be returned in any case
				return throwError(
					() => new Error('value is unsuitable to build the correct url')
				);

				// this would just throw an error that we will have to catch with try & catch:
				// throw new Error('value is unsuitable to build the correct url');
			}
		}

		getUrl$(4).subscribe({
			error(err) {
				console.log(err);
			},
		});
	}
	// ethrowError();

		}

// # handling error

// = using subscribe
function eSubscribe() {
	errorObservable$.subscribe(subscriber);
	// we cannot recover from error or emit fallback value!
}
// eSubscribe();

// = catchError operator and catching strategies
//  hits only if error occurs in the stream, otherwise eror handling function is not executed
//  error handling function must return an observable no matter which strategy we use

// ~ replacement strategy
function eCatchErrorReplace() {
	errorObservable$
		.pipe(
			catchError((error) => {
				// original observable errored out and cannot be used, so we need to return a new one, if we want to revive the stream
				return of('replacement value'); // emits to 'next' stream
			})
		)
		.subscribe(subscriber);
}
// eCatchErrorReplace();

// ~ re-throw strategy
// throwError operator acts like our initial observable - errors out immideately without emitting any values
function eCatchErrorRethrow() {
	errorObservable$
		.pipe(
			catchError((error) => {
				console.log(error); // handle error
				throw new Error(error); // rethrow the original error into error stream
			})
			// we can use catchError several times in the chain if we need it
		)
		.subscribe(subscriber);
}
// eCatchErrorRethrow();

// ~ retry
function eRetry() {
	errorObservable$.pipe(retry(3)).subscribe(subscriber);
	// retries to execute original observables 3 time(by re-subscribing afgain to original observable)
	// then quits
}
eRetry();


function eFinalize() {
	errorObservable$
		.pipe(
			catchError((error) => {
				return of('replacement');
			}),
			finalize(() => {
				// like 'finally' for RxJS, gets executed in any case
				console.log('do something anyway');
			})
		)
		.subscribe(subscriber);
}
// eFinalize();



// ~ ignore error
// = onErrorResumeNext
function eResumeNext() {
	onErrorResumeNext(errorObservable$, of(1)).subscribe(subscriber);
	/* if the first observable errors (or completes),	the second one will be executed (subscribed to) to anyway (like 'finally') */
}
// eResumeNext();
