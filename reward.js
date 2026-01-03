// Single users object
const users = {};

// Constants
const ACTIONS = {
  REFERRAL: { amount: 0.01, dailyLimit: 10 },
  AWARENESS: { amount: 0.0125, dailyLimit: 4 },
  SURVEY: { amount: 0.025, once: true },
  INNOVATIVE_IDEA: { amount: 1 },
  GROUNDBREAKING: { amount: 10 }
};
const DAILY_CAP = 0.125;

// Helper
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

// Ensure user exists
function ensureUser(id) {
  if (!users[id]) {
    users[id] = { balance: 0, history: {}, completed: {} };
  }
}

// Check if user can earn
function canEarn(id, action) {
  ensureUser(id);
  const today = getTodayKey();
  const user = users[id];
  const record = user.history[today] || { earnedToday: 0, actions: {} };

  if (record.earnedToday >= DAILY_CAP) return false;
  if (ACTIONS[action].once && user.completed[action]) return false;
  if (ACTIONS[action].dailyLimit) {
    const count = record.actions[action] || 0;
    if (count >= ACTIONS[action].dailyLimit) return false;
  }

  return true;
}

// Reward user
function reward(id, action) {
  if (!ACTIONS[action]) return console.log("Unknown action");

  if (!canEarn(id, action)) {
    console.log(`❌ Reward denied for ${id} (${action})`);
    return;
  }

  ensureUser(id);
  const today = getTodayKey();
  const user = users[id];

  const amount = ACTIONS[action].amount;

  if (!user.history[today]) {
    user.history[today] = { earnedToday: 0, actions: {} };
  }

  // Cap protection
  if (user.history[today].earnedToday + amount > DAILY_CAP) {
    console.log("❌ Would exceed daily cap");
    return;
  }

  user.balance += amount;
  user.history[today].earnedToday += amount;
  user.history[today].actions[action] =
    (user.history[today].actions[action] || 0) + 1;

  if (ACTIONS[action].once) user.completed[action] = true;

  console.log(`✅ ${id} earned ${amount} DUZ for ${action}`);

  // Notify leaderboard subscribers
  notifyLeaderboard();
}

// --- Leaderboard Subscribers ---
let leaderboardSubscribers = [];

function subscribeLeaderboard(callback) {
  leaderboardSubscribers.push(callback);
}

function notifyLeaderboard() {
  leaderboardSubscribers.forEach(cb => cb());
}

// --- TEST ---
reward("alice", "REFERRAL");
reward("alice", "AWARENESS");
reward("alice", "REFERRAL");
reward("alice", "SURVEY");
reward("alice", "AWARENESS");
reward("alice", "AWARENESS");
reward("alice", "AWARENESS");
reward("alice", "AWARENESS"); // should be blocked

console.log(users);