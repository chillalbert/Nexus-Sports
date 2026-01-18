
import { Sport, User, Venue, Match, MatchStatus, DrillVideo } from './types';

export const MOCK_VENUES: Venue[] = [
  { id: 'v1', name: 'Central Park Courts', address: '79th St Transverse', lat: 40.7812, lng: -73.9665, isPublic: true },
  { id: 'v2', name: 'West Side Tennis Club', address: '1 Tennis Pl', lat: 40.7188, lng: -73.8511, isPublic: true },
  { id: 'v3', name: 'Riverside Soccer Pitch', address: 'W 101st St', lat: 40.8016, lng: -73.9723, isPublic: true },
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'strikeforce99@nexus.com',
    username: 'StrikeForce99',
    dob: '2008-05-15',
    ageCategory: 'minor',
    reliabilityScore: 98,
    coinBalance: 450,
    parentId: 'p1',
    isVerified: true,
    friends: ['u2'],
    followers: [],
    following: [],
    applicationStatus: 'none',
    elo: { [Sport.BASKETBALL_1V1]: 1250, [Sport.FOOTBALL_3V3]: 1100, [Sport.SOCCER_3V3]: 1050, [Sport.TENNIS_1V1]: 1000 }
  },
  {
    id: 'u2',
    email: 'dribbleking@nexus.com',
    username: 'DribbleKing',
    dob: '2010-11-22',
    ageCategory: 'minor',
    reliabilityScore: 100,
    coinBalance: 120,
    parentId: 'p2',
    isVerified: true,
    friends: ['u1'],
    followers: [],
    following: [],
    applicationStatus: 'pending', // Added pending status for verification testing
    elo: { [Sport.BASKETBALL_1V1]: 1300, [Sport.FOOTBALL_3V3]: 1000, [Sport.SOCCER_3V3]: 1000, [Sport.TENNIS_1V1]: 1000 }
  },
  {
    id: 'u3',
    email: 'proathlete_x@nexus.com',
    username: 'ProAthlete_X',
    dob: '1995-02-10',
    ageCategory: 'adult',
    reliabilityScore: 100,
    coinBalance: 5000,
    isVerified: true,
    friends: [],
    followers: [],
    following: [],
    applicationStatus: 'none',
    elo: { [Sport.BASKETBALL_1V1]: 2200, [Sport.FOOTBALL_3V3]: 1800, [Sport.SOCCER_3V3]: 1900, [Sport.TENNIS_1V1]: 1500 }
  }
];

export const MOCK_VIDEOS: DrillVideo[] = [
  {
    id: 'd1',
    title: 'Perfect Free Throw Form',
    author: 'Coach Miller',
    authorId: 'u3',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: 1240,
    comments: 89,
    sport: Sport.BASKETBALL_1V1
  },
  {
    id: 'd2',
    title: 'Top Spin Mastery',
    author: 'ProTennis_HQ',
    authorId: 'u3',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes: 850,
    comments: 32,
    sport: Sport.TENNIS_1V1
  }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    sport: Sport.BASKETBALL_1V1,
    skillLevelReq: 3,
    isCompetitive: true,
    venueId: 'v1',
    scheduledAt: '2024-05-20T16:00:00Z',
    status: MatchStatus.CREATED,
    ageCategory: 'minor',
    creatorId: 'u2',
    participants: ['u2'],
    checkInStatus: { 'u2': 'none' },
    verificationCodes: { 'u2': 'ABCD12' }
  },
  {
    id: 'm2',
    sport: Sport.SOCCER_3V3,
    skillLevelReq: 4,
    isCompetitive: false,
    venueId: 'v3',
    scheduledAt: '2024-05-21T18:00:00Z',
    status: MatchStatus.CREATED,
    ageCategory: 'adult',
    creatorId: 'u3',
    participants: ['u3'],
    checkInStatus: { 'u3': 'none' },
    verificationCodes: { 'u3': 'EFGH34' }
  }
];
