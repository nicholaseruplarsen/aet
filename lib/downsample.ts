// stocks/lib/downsample.ts

import { StockData } from '@/types';

/**
 * Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm.
 * @param data Array of StockData points.
 * @param threshold Number of points to downsample to.
 * @returns Downsampled array of StockData points.
 */
export function largestTriangleThreeBuckets(data: StockData[], threshold: number): StockData[] {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold === 0) {
    return data; // Nothing to do
  }

  const sampled: StockData[] = [];
  let sampledIndex = 0;

  // Bucket size. Leave room for start and end data points
  const every = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially a is the first point in the triangle
  sampled[sampledIndex++] = data[a]; // Always add the first point

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate range for this bucket
    const rangeStart = Math.floor((i + 1) * every) + 1;
    const rangeEnd = Math.floor((i + 2) * every) + 1;
    const range = data.slice(rangeStart, rangeEnd);

    // Point a
    const pointA = data[a];

    // Calculate average for next bucket
    const avgRangeStart = Math.floor((i + 1) * every) + 1;
    const avgRangeEnd = Math.floor((i + 2) * every) + 1;
    const avgRange = data.slice(avgRangeStart, avgRangeEnd);

    const avgX = avgRange.reduce((sum, d) => sum + new Date(d.date).getTime(), 0) / avgRange.length;
    const avgY = avgRange.reduce((sum, d) => sum + d.close, 0) / avgRange.length;

    // Find the point with the largest triangle area
    let maxArea = -1;
    let maxAreaPoint: StockData | null = null;
    let maxAreaIndex = -1;

    const rangeLength = range.length;
    for (let j = 0; j < rangeLength; j++) {
      const point = range[j];
      const area = Math.abs(
        (pointA.close - avgY) * (new Date(point.date).getTime() - new Date(pointA.date).getTime()) -
        (pointA.close - point.close) * (avgX - new Date(pointA.date).getTime())
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = point;
        maxAreaIndex = j + rangeStart;
      }
    }

    if (maxAreaPoint) {
      sampled[sampledIndex++] = maxAreaPoint;
      a = maxAreaIndex;
    }
  }

  sampled[sampledIndex++] = data[dataLength - 1]; // Always add the last point

  return sampled;
}
