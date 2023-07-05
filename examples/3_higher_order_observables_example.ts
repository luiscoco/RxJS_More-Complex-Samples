import {
	Observable,
	concatMap,
	exhaustMap,
	interval,
	map,
	mergeMap,
	pipe,
	switchMap,
	take,
	tap,
} from 'rxjs';


interface Trek {
	artist: string;
	album: string;
	name: string;
}

class Disk {
	constructor(
		public artist: string,
		public name: string,
		private treklist: string[]
	) {}

	play$() {
		return interval(2000).pipe<Trek, Trek>(
			map((trekNumber) => ({
				name: this.treklist[trekNumber],
				album: this.name,
				artist: this.artist,
			})),
			take(this.treklist.length)
		);
	}
}

const theWall = new Disk('Pink Floyd', 'The Wall', [
	'Hey You',
	'Another Brick in the Wall',
	'Comfortably Numb',
]);

const violator = new Disk('Depeche Mode', 'Violator', [
	'Personal Jesus',
	'Enjoy the Silence',
	'The World in My Eyes',
]);

const disksCollection = [theWall, violator];

const mergeDJ$ = pipe(
	mergeMap((disk: Disk) => {
		console.log(
			`DJ: No problem, give me the disk, I will play them all at once, I'll start playing ${disk.name} right now`
		);
		return disk.play$();
	})
);

const concatDJ$ = pipe<Observable<Disk>, Observable<Disk>, Observable<Trek>>(
	tap(() => {
		console.log(
			`DJ: Sorry, I'll put your order on the list, give me the disk, but I'll play it only after the others`
		);
	}),
	concatMap((disk: Disk) => {
		console.log(
			`DJ: OK, the previous disk finished playing, now I can play your order ${disk.name}, that's on my list`
		);
		return disk.play$();
	})
);

const switchDJ$ = pipe(
	switchMap((disk: Disk) => {
		console.log(
			`DJ: OK, you're paying me more, so I'll ditch the previous disk and start playing ${disk.name} right away `
		);
		return disk.play$();
	})
);

const exhaustDJ$ = pipe<Observable<Disk>, Observable<Disk>, Observable<Trek>>(
	tap(() => {
		console.log(
			`DJ: sorry, but I don't take new orders until the previous one has not finished playing`
		);
	}),
	exhaustMap((disk: Disk) => {
		console.log(
			`DJ: OK seems like nothing is playing right now, so I'll start playig your order`
		);
		return disk.play$();
	})
);

// after the specified interval emits an order for new disk from collection
const clientOrders$ = interval(2500).pipe(
	map((order) => disksCollection[order]),
	take(disksCollection.length),
	tap((disk) =>
		console.log('new disk order from client:', disk.artist, disk.name)
	)
);

clientOrders$
	.pipe(
		// mergeDJ$
		// switchDJ$
		// concatDJ$
		exhaustDJ$
	)
	.subscribe(function soundSystem(song) {
		console.log(song.album, '-', song.name);
	});
