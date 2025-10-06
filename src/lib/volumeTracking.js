import { DEFAULT_MUSCLE_TARGETS } from "../data/muscleGroups.js";

export function normalizeTargets(savedTargets) {
  const targetMap = new Map(savedTargets?.map((item) => [item.id, item]) ?? []);
  return DEFAULT_MUSCLE_TARGETS.map((muscle) => ({
    ...muscle,
    target: Number(
      (targetMap.get(muscle.id)?.target ?? muscle.target).toFixed(2)
    ),
  }));
}

export function createEmptyVolumeState(muscles = DEFAULT_MUSCLE_TARGETS) {
  return muscles.reduce((acc, muscle) => {
    acc[muscle.id] = 0;
    return acc;
  }, {});
}

export function accumulateSet(volumeState, exercise, sets) {
  const updated = { ...volumeState };
  const increment = Number(sets) || 0;

  exercise.primaryMuscles?.forEach((muscle) => {
    if (updated[muscle] !== undefined) {
      updated[muscle] = roundToTwo(updated[muscle] + increment);
    }
  });

  exercise.secondaryMuscles?.forEach((muscle) => {
    if (updated[muscle] !== undefined) {
      updated[muscle] = roundToTwo(updated[muscle] + increment * 0.5);
    }
  });

  return updated;
}

export function computeProgress(volumeState, targets) {
  return targets.map((muscle) => {
    const volume = volumeState[muscle.id] ?? 0;
    const ratio = muscle.target === 0 ? 0 : Math.min(volume / muscle.target, 1.25);
    return {
      ...muscle,
      volume,
      completion: Number((ratio * 100).toFixed(1)),
    };
  });
}

export function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

export function summarizeLogs(logs, muscles = DEFAULT_MUSCLE_TARGETS) {
  const base = createEmptyVolumeState(muscles);
  return logs.reduce((state, log) => accumulateSet(state, log.exercise, log.sets), base);
}
