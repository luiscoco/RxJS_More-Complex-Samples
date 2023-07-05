import {
	Observable,
	concatMap,
	delay,
	exhaustMap,
	from,
	interval,
	map,
	mergeMap,
	of,
	pipe,
	range,
	switchMap,
	take,
	tap,
} from 'rxjs';

//  real usecase:
/*
const file$ = urlObservable$.pipe(
  map(url => http.get(url)),
);
 */


function calculateNewValue$(value) {
	return of(value * 2);
}

function eNoNestedSubscribe() {
	range(0, 4)
		.pipe(
			map((value) => {
				const newValue$ = calculateNewValue$(value); // we have an inner Observable!
				// how do we get values from it?

				// ! nested subscription - DON'T DO THIS!
				newValue$.subscribe((result) => {
					console.log(result);
					// do something here
				});

				// if we return the value, we'll get Observables in subscribe
				// we get a higher-order observable (metastream)- observable that emits other observables rather then plain values
				return newValue$;
			})
		)
		.subscribe((result) => {
			console.log(result);
		});

	// right way to do this - return the inner observable and use flattening operator like mergeMap to 'flatten' the observables
	range(0, 4)
		.pipe(
			mergeMap((value) => {
				return calculateNewValue$(value);
			})
		)
		.subscribe((result) => {
			console.log(result);
		});
}
// eNoNestedSubscribe()


