import { findExercisesByMuscle } from "../data/exercises.js";
import { roundToTwo } from "./volumeTracking.js";

export function findMuscleGaps(progress, threshold = 0.9) {
  return progress.filter((item) => item.target > 0 && item.volume < item.target * threshold);
}

export function buildRecommendations(progress, logsByExercise = {}) {
  const gaps = findMuscleGaps(progress);

  return gaps.map((muscle) => {
    const exercises = findExercisesByMuscle(muscle.id)
      .map((exercise) => ({
        exercise,
        recentSets: roundToTwo(logsByExercise[exercise.id] ?? 0),
      }))
      .sort((a, b) => a.recentSets - b.recentSets);

    return {
      muscle,
      exercises: exercises.slice(0, 3),
    };
  });
}

export function tallyLogsByExercise(logs) {
  return logs.reduce((acc, log) => {
    acc[log.exercise.id] = roundToTwo((acc[log.exercise.id] ?? 0) + Number(log.sets || 0));
    return acc;
  }, {});
}
