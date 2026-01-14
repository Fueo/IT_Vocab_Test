// core/rewards.data.ts
export type RewardType = 'frame' | 'consumable' | 'badge';

export type Reward = {
    id: string;
    title: string;
    description: string;
    type: RewardType;

    // frame
    frameId?: 'frame1' | 'frame2' | 'frame3' | 'frame4' | 'frame5' | 'frame6';

    // consumable/badge icon
    icon?: string;

    // milestone meta
    requirementText: string; // vd: "Reach Level 10"
};

export type RewardSectionKey = 'level' | 'streak' | 'leaderboard';

export type RewardSection = {
    key: RewardSectionKey;
    title: string;
    subtitle: string;
    rewards: Reward[];
};

export const REWARD_SECTIONS: RewardSection[] = [
    {
        key: 'level',
        title: 'Level Rewards',
        subtitle: 'Unlock rewards when you reach a level milestone.',
        rewards: [
            {
                id: 'lv-5',
                title: 'Starter Frame',
                description: 'A simple frame for your avatar.',
                type: 'frame',
                frameId: 'frame1',
                requirementText: 'Reach Level 5',
            },
            {
                id: 'lv-10',
                title: 'Silver Frame',
                description: 'Shiny and clean.',
                type: 'frame',
                frameId: 'frame2',
                requirementText: 'Reach Level 10',
            },
            {
                id: 'lv-20',
                title: 'XP Booster x3',
                description: 'Boost XP earned in the next lessons.',
                type: 'consumable',
                icon: 'flash',
                requirementText: 'Reach Level 20',
            },
        ],
    },
    {
        key: 'streak',
        title: 'Streak Rewards',
        subtitle: 'Keep your streak going to earn streak rewards.',
        rewards: [
            {
                id: 'st-7',
                title: 'Streak Badge',
                description: 'Show off your 7-day streak.',
                type: 'badge',
                icon: 'flame',
                requirementText: 'Maintain 7-day streak',
            },
            {
                id: 'st-30',
                title: 'Bronze Frame',
                description: 'A warm bronze look.',
                type: 'frame',
                frameId: 'frame3',
                requirementText: 'Maintain 30-day streak',
            },
            {
                id: 'st-60',
                title: 'XP Booster x5',
                description: 'Boost XP for the next lessons.',
                type: 'consumable',
                icon: 'flash',
                requirementText: 'Maintain 60-day streak',
            },
        ],
    },
    {
        key: 'leaderboard',
        title: 'Leaderboard Rewards',
        subtitle: 'Climb the ranks and earn exclusive rewards.',
        rewards: [
            {
                id: 'lb-10',
                title: 'Top 10 Frame',
                description: 'Exclusive frame for Top 10 players.',
                type: 'frame',
                frameId: 'frame4',
                requirementText: 'Finish Top 10 on leaderboard',
            },
            {
                id: 'lb-3',
                title: 'Top 3 Badge',
                description: 'A special badge for Top 3.',
                type: 'badge',
                icon: 'trophy',
                requirementText: 'Finish Top 3 on leaderboard',
            },
            {
                id: 'lb-1',
                title: 'Champion Frame',
                description: 'Only for #1 champion!',
                type: 'frame',
                frameId: 'frame6',
                requirementText: 'Finish #1 on leaderboard',
            },
        ],
    },
];
