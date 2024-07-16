import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Sighting {
    id?: number;
    species: string;
    sex: string;
    location: {
        latitude: number;
        longitude: number;
    };
    date: string;
    notes: string;
}

let db: IDBDatabase;
let map: L.Map;

window.onload = () => {

    let DBRequest = indexedDB.open('BirdWatchingDB', 1);

    DBRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {

        db = (event.target as IDBOpenDBRequest).result;

        let objectStore = db.createObjectStore('sightings', { keyPath: 'id', autoIncrement: true });

        // second argument is keyPath
        objectStore.createIndex('species', 'species', { unique: false });

        objectStore.createIndex('location.latitude', 'location.latitude', { unique: false });

        objectStore.createIndex('location.longitude', 'location.longitude', { unique: false });

        objectStore.createIndex('date', 'date', { unique: false });
    };

    DBRequest.onsuccess = (event: Event) => {
        db = (event.target as IDBOpenDBRequest).result;
        displaySightings();
    }

    DBRequest.onerror = (event: Event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.log('Error opening database:', error ? error.message : 'Unknown error');
    };

    document.getElementById('birdForm')!.addEventListener('submit', event => {
        event.preventDefault();
        let species = (document.getElementById('species') as HTMLInputElement).value;

        let sex = (document.getElementById('sex') as HTMLSelectElement).value;

        let latitude = parseFloat((document.getElementById('latitude') as HTMLInputElement).value);

        let longitude = parseFloat((document.getElementById('longitude') as HTMLInputElement).value);

        let date = (document.getElementById('date') as HTMLInputElement).value;

        let notes = (document.getElementById('notes') as HTMLTextAreaElement).value;

        addSighting(species, sex, latitude, longitude, date, notes);

        resetForm();
    });
};

function addSighting(species: string, sex: string, latitude: number, longitude: number, date: string, notes: string) {
    let transaction = db.transaction(['sightings'], 'readwrite');
    let objectStore = transaction.objectStore('sightings');
    let sighting: Sighting = { species, sex, location: { latitude, longitude }, date, notes };
    let request = objectStore.add(sighting);

    request.onsuccess = () => {
        displaySightings();
    };

    request.onerror = (event: Event) => {
        let error = (event.target as IDBRequest).error;
        console.log('error adding birb', error ? error.message : 'Unknown error');
    };
}

function displaySightings() {
    let transaction = db.transaction(['sightings'], 'readonly');
    let objectStore = transaction.objectStore('sightings');
    let request = objectStore.getAll();
  
    request.onsuccess = (event: Event) => {
      let sightings = (event.target as IDBRequest).result as Sighting[];

      // sort the birds by sighting date rather than by entry date
      sightings = sightings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const sightingsList = document.getElementById('sightingsList')!;
      sightingsList.innerHTML = '';
  
      sightings.forEach(sighting => {
        const listItem = document.createElement('li');
        listItem.textContent = `${sighting.date}: ${sighting.species} (${sighting.sex}) at (${sighting.location.latitude}, ${sighting.location.longitude}) - ${sighting.notes}`;
        sightingsList.appendChild(listItem);
      });
    };
  }

  function resetForm() {
    (document.getElementById('birdForm') as HTMLFormElement).reset();
  }