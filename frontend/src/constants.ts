export const VOTE_THRESHOLD = 3;
export const REPORT_VOTE_THRESHOLD = 3;

export const REPORT_POINTS_BY_SIZE: Record<string, number> = {
  small: 10,
  medium: 15,
  large: 20,
};

export function getReportPointsForSize(size: string): number {
  return REPORT_POINTS_BY_SIZE[size.toLowerCase()] ?? 10;
}
