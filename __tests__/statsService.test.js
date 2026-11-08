import statsService from '../src/services/statsService';
import storage from '../src/services/storageService';
import firestoreService from '../src/services/firestoreService';
import { dateKey } from '../src/services/checkinService';

// The statistics are pure functions over the check-ins; storage and the cloud sync are mocked.
jest.mock('../src/services/storageService', () => ({
  __esModule: true,
  default: { get: jest.fn(), set: jest.fn(), bestStreakKey: (id) => `best_${id}` },
}));
jest.mock('../src/services/firestoreService', () => ({
  __esModule: true,
  default: { syncHabitData: jest.fn(() => Promise.resolve()) },
}));

// "Today" is fixed so streaks and success rates are deterministic.
const TODAY = new Date(2026, 4, 20, 12, 0, 0); // 20 May 2026, a Wednesday

/** Builds a check-ins map from { daysAgo: status } (or { daysAgo: { status, trigger } }). */
function checkins(spec) {
  const out = {};
  for (const [daysAgo, value] of Object.entries(spec)) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - Number(daysAgo));
    const key = dateKey(d);
    out[key] = typeof value === 'string' ? { status: value, date: key } : { ...value, date: key };
  }
  return out;
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(TODAY);
  jest.clearAllMocks();
});
afterEach(() => jest.useRealTimers());

describe('computeCurrentStreak', () => {
  test('is 0 with no check-ins', () => {
    expect(statsService.computeCurrentStreak({})).toBe(0);
  });

  test('counts consecutive successful days ending today', () => {
    expect(statsService.computeCurrentStreak(checkins({ 0: 'success', 1: 'success', 2: 'success' }))).toBe(3);
  });

  test('still counts from yesterday when today has no check-in yet', () => {
    expect(statsService.computeCurrentStreak(checkins({ 1: 'success', 2: 'success' }))).toBe(2);
  });

  test('a grace day keeps the streak going', () => {
    expect(statsService.computeCurrentStreak(checkins({ 0: 'success', 1: 'grace', 2: 'success' }))).toBe(3);
  });

  test('a relapse ends the streak', () => {
    expect(statsService.computeCurrentStreak(checkins({ 0: 'success', 1: 'relapse', 2: 'success' }))).toBe(1);
  });

  test('a missing day ends the streak', () => {
    expect(statsService.computeCurrentStreak(checkins({ 0: 'success', 2: 'success', 3: 'success' }))).toBe(1);
  });

  test('a relapse today means no current streak', () => {
    expect(statsService.computeCurrentStreak(checkins({ 0: 'relapse', 1: 'success' }))).toBe(1);
  });
});

describe('computeBestStreak', () => {
  test('returns the stored best when there are no check-ins', async () => {
    storage.get.mockResolvedValue(5);
    await expect(statsService.computeBestStreak('h1', {})).resolves.toBe(5);
    expect(storage.set).not.toHaveBeenCalled();
  });

  test('finds the longest run and saves it when it beats the stored best', async () => {
    storage.get.mockResolvedValue(1);
    const data = checkins({ 6: 'success', 5: 'success', 4: 'grace', 3: 'relapse', 2: 'success', 1: 'success' });
    await expect(statsService.computeBestStreak('h1', data)).resolves.toBe(3);
    expect(storage.set).toHaveBeenCalledWith('best_h1', 3);
    expect(firestoreService.syncHabitData).toHaveBeenCalledWith('h1', 'bestStreak', 3);
  });

  test('a missing day breaks the run, like for the current streak', async () => {
    storage.get.mockResolvedValue(0);
    // Two successes, then a day with no check-in, then one more success: the best run is 2, not 3.
    const data = checkins({ 4: 'success', 3: 'success', 1: 'success' });
    await expect(statsService.computeBestStreak('h1', data)).resolves.toBe(2);
  });

  test('success days far apart are separate runs', async () => {
    storage.get.mockResolvedValue(0);
    await expect(statsService.computeBestStreak('h1', checkins({ 9: 'success', 0: 'success' }))).resolves.toBe(1);
  });

  test('keeps the stored best when the history is shorter', async () => {
    storage.get.mockResolvedValue(10);
    await expect(statsService.computeBestStreak('h1', checkins({ 1: 'success', 0: 'success' }))).resolves.toBe(10);
    expect(storage.set).not.toHaveBeenCalled();
  });
});

describe('computeSuccessRate', () => {
  test('is 0 when there are no check-ins in the window', () => {
    expect(statsService.computeSuccessRate({}, 7)).toBe(0);
  });

  test('counts successes over all check-ins in the window, rounded', () => {
    // 2 successes, 1 relapse, 1 grace in the last 7 days: 2 / 4 = 50%
    const data = checkins({ 0: 'success', 1: 'relapse', 2: 'grace', 3: 'success' });
    expect(statsService.computeSuccessRate(data, 7)).toBe(50);
  });

  test('ignores check-ins older than the window', () => {
    const data = checkins({ 0: 'success', 10: 'relapse' });
    expect(statsService.computeSuccessRate(data, 7)).toBe(100);
    expect(statsService.computeSuccessRate(data, 30)).toBe(50);
  });
});

describe('relapse statistics', () => {
  const data = checkins({
    0: 'success',
    1: { status: 'relapse', trigger: 'stres' },
    3: { status: 'relapse', trigger: 'plictiseala' },
    8: { status: 'relapse', trigger: 'stres' },
  });

  test('computeTotalRelapses counts only relapses', () => {
    expect(statsService.computeTotalRelapses(data)).toBe(3);
  });

  test('getMostCommonTrigger returns the most frequent trigger', () => {
    expect(statsService.getMostCommonTrigger(data)).toBe('stres');
  });

  test('getMostCommonTrigger is null without relapses', () => {
    expect(statsService.getMostCommonTrigger(checkins({ 0: 'success' }))).toBeNull();
  });

  test('getHardestDayOfWeek returns the day with the most relapses', () => {
    // 1 and 8 days before Wednesday 20 May 2026 are both Tuesdays.
    expect(statsService.getHardestDayOfWeek(data)).toBe('Mar');
  });

  test('getHardestDayOfWeek is null without relapses', () => {
    expect(statsService.getHardestDayOfWeek({})).toBeNull();
  });
});
