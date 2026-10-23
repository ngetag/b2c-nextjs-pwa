export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

export function buildAttendanceId(userId: string, eventId: string): string {
  return `${userId}:event:${eventId}`;
}
