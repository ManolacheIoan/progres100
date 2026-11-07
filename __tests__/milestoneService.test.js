import milestoneService from '../src/services/milestoneService';
import storage from '../src/services/storageService';
import checkinService, { dateKey } from '../src/services/checkinService';
import { MILESTONE_DEFINITIONS } from '../src/constants/milestoneDefinitions';

jest.mock('../src/services/storageService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    milestoneKey: (id) => `milestones_${id}`,
    bestStreakKey: (id) => `best_${id}`,
  },
}));
jest.mock('../src/services/firestoreService', () => ({
  __esModule: true,
  default: { syncHabitData: jest.fn(() => Promise.resolve()) },
}));
jest.mock('../src/services/checkinService', () => {
  const actual = jest.requireActual('../src/services/checkinService');
  return { __esModule: true, ...actual, default: { getAllCheckins: jest.fn() } };
});

const TODAY = new Date(2026, 4, 20, 12, 0, 0);

/** A streak of `days` successful days ending today. */
function streak(days) {
  const out = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - i);
    out[dateKey(d)] = { status: 'success', date: dateKey(d) };
  }
  return out;
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(TODAY);
  jest.clearAllMocks();
  storage.get.mockResolvedValue([]);
});
afterEach(() => jest.useRealTimers());

test('a 7-day streak unlocks every milestone up to one week', async () => {
  checkinService.getAllCheckins.mockResolvedValue(streak(7));
  const unlocked = await milestoneService.checkAndUnlock('h1');
  const expected = MILESTONE_DEFINITIONS.filter((m) => m.days <= 7).map((m) => m.id);
  expect(unlocked.map((m) => m.id)).toEqual(expected);
  expect(storage.set).toHaveBeenCalledWith('milestones_h1', expect.arrayContaining(unlocked));
});

test('milestones already achieved are not unlocked again', async () => {
  checkinService.getAllCheckins.mockResolvedValue(streak(3));
  storage.get.mockResolvedValue([{ id: 'day_1' }, { id: 'day_3' }]);
  await expect(milestoneService.checkAndUnlock('h1')).resolves.toEqual([]);
  expect(storage.set).not.toHaveBeenCalled();
});

test('the next milestone is the first one above the current streak', async () => {
  checkinService.getAllCheckins.mockResolvedValue(streak(4));
  storage.get.mockResolvedValue([{ id: 'day_1' }, { id: 'day_3' }]);
  const next = await milestoneService.getNextMilestone('h1');
  expect(next.id).toBe('day_7');
});

test('progress toward each milestone is capped at 100%', async () => {
  checkinService.getAllCheckins.mockResolvedValue(streak(5));
  const all = await milestoneService.getAllWithStatus('h1');
  const week = all.find((m) => m.id === 'day_7');
  expect(week.progress).toBeCloseTo(5 / 7);
  expect(all.find((m) => m.id === 'day_3').progress).toBe(1);
});

test('without a habit there is nothing to unlock', async () => {
  await expect(milestoneService.checkAndUnlock(null)).resolves.toEqual([]);
});
