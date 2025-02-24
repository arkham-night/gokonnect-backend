export class DateHelper {
  // Format date to ISO string
  public static toISOString(date: Date): string {
    return date.toISOString();
  }

  // Get date range for queries
  public static getDateRange(
    startDate: Date,
    endDate: Date
  ): { $gte: Date; $lte: Date } {
    return {
      $gte: startDate,
      $lte: endDate,
    };
  }

  // Check if date is in the future
  public static isFutureDate(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  // Calculate duration between two dates in minutes
  public static getDurationInMinutes(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  // Format duration for display
  public static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    }
    
    return `${hours} hours ${remainingMinutes} minutes`;
  }
}