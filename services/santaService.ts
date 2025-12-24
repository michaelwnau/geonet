import { SantaStop, SantaState } from '../types';

const SANTA_ROUTE_URL = 'https://firebasestorage.googleapis.com/v0/b/santa-api.appspot.com/o/route%2Fsanta.json?alt=media';

export const fetchSantaState = async (): Promise<SantaState> => {
    const response = await fetch(SANTA_ROUTE_URL);
    const data = await response.json();
    const destinations: SantaStop[] = data.destinations;

    // Time Realignment Logic
    // The API data is from 2019. We need to offset the current time back to 2019
    // to find where Santa "would be" in the 2019 schedule.
    const now = Date.now();
    const currentYear = new Date(now).getFullYear();
    const anchorCurrent = new Date(`${currentYear}-12-24T00:00:00Z`).getTime();
    const anchor2019 = new Date('2019-12-24T00:00:00Z').getTime();
    const timeOffset = anchorCurrent - anchor2019;
    const simulatedNow = now - timeOffset;

    // Find where Santa is right now based on simulated time
    let lastStop: SantaStop | null = null;
    let nextStop: SantaStop | null = null;

    for (let i = 0; i < destinations.length; i++) {
        if (destinations[i].arrival <= simulatedNow && destinations[i].departure >= simulatedNow) {
            // Santa is at this stop
            lastStop = destinations[i];
            nextStop = destinations[i + 1] || null;
            return {
                currentLocation: destinations[i].location,
                lastStop,
                nextStop,
                presentsDelivered: destinations[i].presentsDelivered,
                status: `AT_STOP: ${destinations[i].city.toUpperCase()}`
            };
        }

        if (destinations[i].departure < simulatedNow && (destinations[i + 1]?.arrival > simulatedNow || !destinations[i + 1])) {
            // Santa is en route to the next stop
            lastStop = destinations[i];
            nextStop = destinations[i + 1] || null;

            if (!nextStop) {
                return {
                    currentLocation: lastStop.location,
                    lastStop,
                    nextStop: null,
                    presentsDelivered: lastStop.presentsDelivered,
                    status: 'FINISHED'
                };
            }

            // Interpolate position using simulated time
            const totalTime = nextStop.arrival - lastStop.departure;
            const elapsedTime = simulatedNow - lastStop.departure;
            const ratio = Math.min(elapsedTime / totalTime, 1);

            const lat = lastStop.location.lat + (nextStop.location.lat - lastStop.location.lat) * ratio;
            const lng = lastStop.location.lng + (nextStop.location.lng - lastStop.location.lng) * ratio;

            return {
                currentLocation: { lat, lng },
                lastStop,
                nextStop,
                presentsDelivered: lastStop.presentsDelivered + Math.floor((nextStop.presentsDelivered - lastStop.presentsDelivered) * ratio),
                status: `EN_ROUTE_TO: ${nextStop.city.toUpperCase()}`
            };
        }
    }

    // If not started yet in simulated time
    return {
        currentLocation: destinations[0].location,
        lastStop: null,
        nextStop: destinations[0],
        presentsDelivered: 0,
        status: 'NOT_STARTED'
    };
};
