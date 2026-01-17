
import { Sport, User, Match } from '../types';

/**
 * ELO MATCHMAKING LOGIC
 * Formula: Ra' = Ra + K * (Sa - Ea)
 * Ea = 1 / (1 + 10^((Rb - Ra) / 400))
 */
export const calculateEloChange = (playerRating: number, opponentRating: number, outcome: 1 | 0): number => {
  const K = 32;
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(K * (outcome - expectedScore));
};

/**
 * COIN ECONOMY
 * Play-to-Earn tiers
 */
export const REWARDS = {
  MATCH_COMPLETE: 5,
  MATCH_WIN: 20,
  TOURNAMENT_CHAMPION: 1000,
};

/**
 * TOURNAMENT GENERATION
 * 90-Day Cycle: Jan, Apr, July, Oct
 */
export const getNextTournamentDate = () => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  const quarters = [0, 3, 6, 9]; // Jan, Apr, Jul, Oct
  const nextMonth = quarters.find(q => q > month) ?? 0;
  const nextYear = nextMonth === 0 ? year + 1 : year;
  
  return new Date(nextYear, nextMonth, 1);
};

/**
 * FUZZY LOCATION (0.5 Mile Blur)
 */
export const getBlurredLocation = (lat: number, lng: number) => {
  // Simple grid snapping for demo
  const snap = (val: number) => Math.round(val * 100) / 100;
  return { lat: snap(lat), lng: snap(lng) };
};

/**
 * RELIABILITY SCORE DECAY
 */
export const handleNoShow = (currentScore: number) => {
  return Math.max(0, currentScore - 20);
};
