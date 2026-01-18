
export type UserCategory = 'minor' | 'adult' | 'parent';

export enum Sport {
  BASKETBALL_1V1 = 'Basketball 1v1',
  FOOTBALL_3V3 = 'Football 3v3',
  SOCCER_3V3 = 'Soccer 3v3',
  TENNIS_1V1 = 'Tennis 1v1'
}

export enum MatchStatus {
  CREATED = 'created',
  CHECK_IN = 'check_in',
  HANDSHAKE = 'handshake',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

export type ApplicationStatus = 'none' | 'pending' | 'approved' | 'declined';

export interface User {
  id: string;
  email: string;
  username: string;
  dob: string;
  ageCategory: UserCategory;
  reliabilityScore: number;
  coinBalance: number;
  parentId?: string;
  isVerified: boolean;
  elo: Record<Sport, number>;
  friends: string[];
  followers: string[];
  following: string[];
  isAdmin?: boolean;
  applicationStatus?: ApplicationStatus;
  canPostVideos?: boolean;
  notifications?: string[];
}

// Fix: Added missing Venue interface required by constants.tsx
export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  isPublic: boolean;
}

export interface Match {
  id: string;
  sport: Sport;
  skillLevelReq: number;
  isCompetitive: boolean;
  venueId: string;
  venueName?: string;
  scheduledAt: string;
  status: MatchStatus;
  ageCategory: UserCategory;
  creatorId: string;
  participants: string[];
  activeBoost?: string;
  checkInStatus: Record<string, 'here' | 'delayed' | 'none'>;
  verificationCodes: Record<string, string>;
  winnerId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isFlagged?: boolean;
}

export interface DrillVideo {
  id: string;
  title: string;
  author: string;
  authorId: string;
  videoUrl: string;
  likes: number;
  comments: number;
  sport: Sport;
  popularityScore?: number;
}
