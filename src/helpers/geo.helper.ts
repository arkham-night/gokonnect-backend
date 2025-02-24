import { Coordinates } from '../types/common.types';

export class GeoHelper {
  // Calculate distance between two points using Haversine formula
  public static calculateDistance(
    point1: Coordinates,
    point2: Coordinates
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) * 
      Math.cos(this.toRad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format coordinates for MongoDB geospatial queries
  public static formatGeoPoint(coordinates: Coordinates): {
    type: string;
    coordinates: number[];
  } {
    return {
      type: 'Point',
      coordinates: [coordinates.longitude, coordinates.latitude],
    };
  }
}