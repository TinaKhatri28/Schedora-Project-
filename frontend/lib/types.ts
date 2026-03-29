export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  timezone: string;
  welcomeMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventType {
  id: string;
  userId: string;
  name: string;
  slug: string;
  duration: number;
  description?: string;
  color: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityDay {
  id?: string;
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

export interface Availability {
  timezone: string;
  days: AvailabilityDay[];
}

export interface Meeting {
  id: string;
  hostId: string;
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  eventType: Pick<EventType, 'name' | 'color' | 'duration'>;
}

export interface SlotsResponse {
  slots: string[];
  timezone: string;
  eventType?: EventType;
}

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  timezone: string;
  welcomeMessage?: string;
}

export interface PublicProfile {
  user: PublicUser;
  eventTypes: EventType[];
}
