export function getHabitName(habit) {
  return habit?.habitName || habit?.name || 'Obicei';
}

export function getHabitIcon(habit) {
  return habit?.habitIcon || habit?.icon || '🎯';
}
