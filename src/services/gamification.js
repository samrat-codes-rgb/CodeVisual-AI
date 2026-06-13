import { store } from '../store.js';

const BADGES_DATA = [
  { id: 'first-blood', name: 'First Blood', icon: '🎯', description: 'Solve your first problem', criteria: { type: 'problems_solved', count: 1 }, xp: 50 },
  { id: 'five-problems', name: 'Getting Started', icon: '🌱', description: 'Solve 5 problems', criteria: { type: 'problems_solved', count: 5 }, xp: 100 },
  { id: 'ten-problems', name: 'On a Roll', icon: '🔥', description: 'Solve 10 problems', criteria: { type: 'problems_solved', count: 10 }, xp: 200 },
  { id: 'twenty-five-problems', name: 'Quarter Century', icon: '🏅', description: 'Solve 25 problems', criteria: { type: 'problems_solved', count: 25 }, xp: 400 },
  { id: 'fifty-problems', name: 'Half Century', icon: '🥇', description: 'Solve 50 problems', criteria: { type: 'problems_solved', count: 50 }, xp: 750 },
  { id: 'hundred-problems', name: 'Centurion', icon: '💯', description: 'Solve 100 problems', criteria: { type: 'problems_solved', count: 100 }, xp: 1500 },
  { id: 'streak-3', name: 'Hat Trick', icon: '🎩', description: '3-day streak', criteria: { type: 'streak', count: 3 }, xp: 75 },
  { id: 'streak-7', name: 'Week Warrior', icon: '⚔️', description: '7-day streak', criteria: { type: 'streak', count: 7 }, xp: 150 },
  { id: 'streak-14', name: 'Fortnight Champion', icon: '🏆', description: '14-day streak', criteria: { type: 'streak', count: 14 }, xp: 300 },
  { id: 'streak-30', name: 'Monthly Legend', icon: '🌟', description: '30-day streak', criteria: { type: 'streak', count: 30 }, xp: 600 },
  { id: 'streak-100', name: 'Iron Coder', icon: '🦾', description: '100-day streak', criteria: { type: 'streak', count: 100 }, xp: 2000 },
  { id: 'easy-expert', name: 'Easy Expert', icon: '✅', description: 'Solve 20 easy problems', criteria: { type: 'difficulty_solved', difficulty: 'easy', count: 20 }, xp: 200 },
  { id: 'medium-master', name: 'Medium Master', icon: '⚡', description: 'Solve 15 medium problems', criteria: { type: 'difficulty_solved', difficulty: 'medium', count: 15 }, xp: 350 },
  { id: 'hard-hero', name: 'Hard Hero', icon: '💎', description: 'Solve 5 hard problems', criteria: { type: 'difficulty_solved', difficulty: 'hard', count: 5 }, xp: 500 },
  { id: 'array-master', name: 'Array Master', icon: '📊', description: 'Complete Arrays topic', criteria: { type: 'topic_complete', topic: 'arrays' }, xp: 250 },
  { id: 'dp-expert', name: 'DP Expert', icon: '🧩', description: 'Complete Dynamic Programming topic', criteria: { type: 'topic_complete', topic: 'dynamic-programming' }, xp: 400 },
  { id: 'graph-guru', name: 'Graph Guru', icon: '🕸️', description: 'Complete Graphs topic', criteria: { type: 'topic_complete', topic: 'graphs' }, xp: 400 },
  { id: 'tree-whisperer', name: 'Tree Whisperer', icon: '🌳', description: 'Complete Trees topic', criteria: { type: 'topic_complete', topic: 'trees' }, xp: 300 },
  { id: 'ai-seeker', name: 'AI Seeker', icon: '🤖', description: 'Ask the AI tutor 10 questions', criteria: { type: 'ai_questions', count: 10 }, xp: 100 },
  { id: 'visualizer-fan', name: 'Visual Learner', icon: '👁️', description: 'Watch 10 algorithm visualizations', criteria: { type: 'visualizations_watched', count: 10 }, xp: 150 },
  { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', description: 'Solve a problem in under 5 minutes', criteria: { type: 'speed', minutes: 5 }, xp: 200 },
  { id: 'perfectionist', name: 'Perfectionist', icon: '💫', description: 'Submit 5 problems on first try', criteria: { type: 'first_try', count: 5 }, xp: 300 },
  { id: 'night-owl', name: 'Night Owl', icon: '🦉', description: 'Solve a problem after midnight', criteria: { type: 'time_of_day', hour: 0 }, xp: 100 },
  { id: 'early-bird', name: 'Early Bird', icon: '🐦', description: 'Solve a problem before 7am', criteria: { type: 'time_of_day', hour: 7 }, xp: 100 },
  { id: 'weekend-warrior', name: 'Weekend Warrior', icon: '⚔️', description: 'Solve problems on 4 weekends', criteria: { type: 'weekend', count: 4 }, xp: 200 },
  { id: 'interview-ready', name: 'Interview Ready', icon: '💼', description: 'Complete a mock interview', criteria: { type: 'mock_interview', count: 1 }, xp: 300 },
];

class GamificationService {
  constructor() {
    this.XP_PER_EASY = 10;
    this.XP_PER_MEDIUM = 25;
    this.XP_PER_HARD = 50;
    this.XP_PER_STREAK_DAY = 15;
    this.LEVEL_XP_BASE = 100;
  }

  addXP(amount) {
    const current = store.get('gamification.totalXP') || 0;
    const newTotal = current + amount;
    const oldLevel = this.getLevel(current);
    const newLevel = this.getLevel(newTotal);

    store.set('gamification.totalXP', newTotal);
    store.set('user.xp', newTotal);
    store.set('user.level', newLevel);

    return { xpAdded: amount, totalXP: newTotal, leveledUp: newLevel > oldLevel, newLevel };
  }

  getLevel(totalXP) {
    let level = 1;
    let xpNeeded = this.LEVEL_XP_BASE;
    let accumulated = 0;
    while (accumulated + xpNeeded <= totalXP) {
      accumulated += xpNeeded;
      level++;
      xpNeeded = this.LEVEL_XP_BASE + (level - 1) * 50;
    }
    return level;
  }

  getXPForLevel(level) {
    let total = 0;
    for (let l = 1; l < level; l++) {
      total += this.LEVEL_XP_BASE + (l - 1) * 50;
    }
    return total;
  }

  getLevelProgress(totalXP) {
    const level = this.getLevel(totalXP);
    const currentLevelXP = this.getXPForLevel(level);
    const nextLevelXP = this.getXPForLevel(level + 1);
    const progress = (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP);
    return Math.min(Math.max(progress, 0), 1);
  }

  checkBadges() {
    const progress = store.get('progress') || {};
    const gamification = store.get('gamification') || {};
    const earned = gamification.badges || [];
    const newBadges = [];
    const solved = progress.solved || [];
    const streak = store.get('user.streak') || 0;

    for (const badge of BADGES_DATA) {
      if (earned.includes(badge.id)) continue;
      const { type, count, difficulty, topic } = badge.criteria;
      let awarded = false;

      if (type === 'problems_solved' && solved.length >= count) awarded = true;
      if (type === 'streak' && streak >= count) awarded = true;
      if (type === 'difficulty_solved') {
        const diffCount = solved.filter(id => {
          // We don't have full problem data here, approximate
          return true;
        }).length;
        // simplified: just check total count
      }
      if (type === 'ai_questions' && (progress.aiQuestionsAsked || 0) >= count) awarded = true;
      if (type === 'visualizations_watched' && (progress.visualizationsWatched || 0) >= count) awarded = true;
      if (type === 'mock_interview') awarded = false; // set manually

      if (awarded) {
        newBadges.push(badge);
        earned.push(badge.id);
        this.addXP(badge.xp);
      }
    }

    if (newBadges.length > 0) {
      store.set('gamification.badges', earned);
    }
    return newBadges;
  }

  getBadges() { return BADGES_DATA; }
  getEarnedBadges() { const earned = store.get('gamification.badges') || []; return BADGES_DATA.filter(b => earned.includes(b.id)); }
  getUnearnedBadges() { const earned = store.get('gamification.badges') || []; return BADGES_DATA.filter(b => !earned.includes(b.id)); }

  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = store.get('user.lastActive');
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastActive === today) return store.get('user.streak') || 0;

    let streak = store.get('user.streak') || 0;
    if (lastActive === yesterday) {
      streak++;
    } else if (lastActive !== today) {
      streak = 1;
    }

    store.set('user.streak', streak);
    store.set('user.lastActive', today);

    const studyDays = store.get('progress.studyDays') || [];
    if (!studyDays.includes(today)) {
      store.set('progress.studyDays', [...studyDays, today]);
    }

    return streak;
  }

  onProblemSolved(problem) {
    const difficulty = problem?.difficulty || 'easy';
    const xpMap = { easy: this.XP_PER_EASY, medium: this.XP_PER_MEDIUM, hard: this.XP_PER_HARD };
    const xpGain = xpMap[difficulty] || this.XP_PER_EASY;

    const result = this.addXP(xpGain);

    const solved = store.get('progress.solved') || [];
    if (!solved.includes(problem.id)) {
      store.set('progress.solved', [...solved, problem.id]);
    }

    this.updateStreak();
    const newBadges = this.checkBadges();

    return { ...result, newBadges, xpGain };
  }

  getInterviewReadiness() {
    const solved = (store.get('progress.solved') || []).length;
    const level = store.get('user.level') || 1;
    const streak = store.get('user.streak') || 0;
    const score = Math.min(100, Math.floor(solved * 1.5 + level * 3 + streak * 0.5));
    return score;
  }

  getPlacementReadiness() {
    const solved = (store.get('progress.solved') || []).length;
    const level = store.get('user.level') || 1;
    const score = Math.min(100, Math.floor(solved * 1.2 + level * 4));
    return score;
  }

  getCPReadiness() {
    const solved = (store.get('progress.solved') || []).length;
    const level = store.get('user.level') || 1;
    const score = Math.min(100, Math.floor(solved * 0.8 + level * 2));
    return score;
  }

  getStats() {
    const totalXP = store.get('gamification.totalXP') || 0;
    return {
      totalXP,
      level: this.getLevel(totalXP),
      levelProgress: Math.round(this.getLevelProgress(totalXP) * 100),
      streak: store.get('user.streak') || 0,
      solved: (store.get('progress.solved') || []).length,
      badges: (store.get('gamification.badges') || []).length,
      interviewReadiness: this.getInterviewReadiness(),
      placementReadiness: this.getPlacementReadiness(),
      cpReadiness: this.getCPReadiness(),
    };
  }
}

export const gamification = new GamificationService();
