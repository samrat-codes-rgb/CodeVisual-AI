// ============================================
// STORE.JS — localStorage state management
// ============================================

const STATE_KEY = 'codevisual_state';

const DEFAULT_STATE = {
  user: {
    name: '',
    goal: '',
    year: '',
    language: 'python',
    hours: 5,
    onboarded: false,
    avatar: '🧑‍💻',
    level: 1,
    xp: 0,
    streak: 0,
    lastActive: null,
    skillScore: 0,
    skillLevel: 'beginner'
  },
  settings: {
    theme: 'dark',
    apiKey: '',
    language: 'python',
    notifications: true,
    soundEffects: true,
    explanationLanguage: 'english'
  },
  progress: {
    solved: [],
    attempted: [],
    bookmarked: [],
    topicMastery: {},
    dailyGoals: [],
    studyDays: [],
    visualizationsWatched: 0,
    aiQuestionsAsked: 0,
    totalStudyMinutes: 0
  },
  gamification: {
    badges: [],
    achievements: [],
    totalXP: 0,
    lastBadgeCheck: null
  },
  chat: {
    history: []
  },
  revision: {
    schedule: [],
    weak: []
  }
};

function deepSet(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function deepGet(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((curr, key) => {
    return curr && curr[key] !== undefined ? curr[key] : undefined;
  }, obj);
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

class Store {
  constructor() {
    this._state = this._load();
    this._subscribers = new Map();
    this._saveTimer = null;
  }

  _load() {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return deepMerge(DEFAULT_STATE, parsed);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify(this._state));
      } catch (e) {
        console.warn('Failed to save state:', e);
      }
    }, 100);
  }

  _notify(path) {
    this._subscribers.forEach((callback, subPath) => {
      if (path.startsWith(subPath) || subPath.startsWith(path) || subPath === '') {
        callback(this.get(subPath));
      }
    });
  }

  get(path) {
    return deepGet(this._state, path);
  }

  set(path, value) {
    deepSet(this._state, path, value);
    this._scheduleSave();
    this._notify(path);
  }

  update(path, updater) {
    const current = this.get(path);
    this.set(path, updater(current));
  }

  subscribe(path, callback) {
    const id = Math.random().toString(36).slice(2);
    this._subscribers.set(id, callback);
    return () => this._subscribers.delete(id);
  }

  reset() {
    this._state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    localStorage.removeItem(STATE_KEY);
    this._notify('');
  }

  getState() {
    return this._state;
  }
}

export const store = new Store();
