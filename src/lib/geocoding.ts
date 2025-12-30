
import axios from 'axios';
import ngeohash from 'ngeohash';

interface GeocodeResult {
  lat: number;
  lon: number;
}

/**
 * Converts a structured address into geographic coordinates (latitude and longitude)
 * using the Nominatim API (OpenStreetMap).
 * @param address - The address object.
 * @returns A promise that resolves to an object with lat and lon.
 */
export async function geocodeAddress(address: {
  logradouro: string;
  cidade: string;
  uf: string;
  cep: string;
}): Promise<GeocodeResult | null> {
  const addressString = `${address.logradouro}, ${address.cidade}, ${address.uf}, ${address.cep}, Brasil`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    addressString
  )}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'A Ponte App/1.0 (bruno@firebase.com)', // Nominatim requires a user agent
      },
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Generates a geohash for the given latitude and longitude.
 * @param lat - The latitude.
 * @param lon - The longitude.
 * @param precision - The desired precision of the geohash.
 * @returns The generated geohash string.
 */
export function generateGeohash(lat: number, lon: number, precision: number = 9): string {
    return ngeohash.encode(lat, lon, precision);
}
