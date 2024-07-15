interface Sighting {
    id?: number;
    species: string;
    location: {
        latitude: number;
        longitude: number;
    };
    date: string;
    notes: string;
}

let db: IDBDatabase;

let request = indexedDB.open('BirdWatchingDB');



