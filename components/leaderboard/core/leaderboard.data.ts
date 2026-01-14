export const LEADERBOARD_DATA = [
    { id: '1', name: 'Nguyen Van A', xp: 15420, streak: 50, avatar: null, initials: 'N', level: 20, equippedFrame: 'frame2' },
    { id: '2', name: 'Tran Thi B', xp: 14200, streak: 65, avatar: null, initials: 'T', level: 18 },
    { id: '3', name: 'Le Van C', xp: 12800, streak: 12, avatar: null, initials: 'L', level: 15 },
    { id: '4', name: 'Pham Thi D', xp: 11500, streak: 22, avatar: null, initials: 'P', level: 14 },
    { id: '5', name: 'Hoang Van E', xp: 10200, streak: 10, avatar: null, initials: 'H', level: 12 },
    { id: '6', name: 'Do Thi F', xp: 9800, streak: 100, avatar: null, initials: 'D', level: 10 },
    { id: '7', name: 'Ngo Van G', xp: 9000, streak: 2, avatar: null, initials: 'N', level: 9 },
    { id: '8', name: 'User Test 1', xp: 8000, streak: 1, avatar: null, initials: 'U', level: 5 },
    { id: '9', name: 'User Test 2', xp: 7000, streak: 1, avatar: null, initials: 'U', level: 4 },
];

export const RANK_COLORS = {
    gold: { main: '#FFD700', gradient: ['#FFD200', '#F7971E'] as [string, string] },
    silver: { main: '#C0C0C0', gradient: ['#BDC3C7', '#2C3E50'] as [string, string] },
    bronze: { main: '#CD7F32', gradient: ['#DAA520', '#8B4513'] as [string, string] },
};

export type TabKey = 'XP' | 'Streak';

export type LeaderboardItem = (typeof LEADERBOARD_DATA)[number] & { rank: number };
