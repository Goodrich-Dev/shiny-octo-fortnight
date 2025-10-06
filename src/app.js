import { DEFAULT_MUSCLE_TARGETS } from "./data/muscleGroups.js";
import { FALLBACK_EXERCISES, fetchExercisesFromApi } from "./data/exercises.js";
import {
  accumulateSet,
  computeProgress,
  normalizeTargets,
  summarizeLogs,
} from "./lib/volumeTracking.js";
import { buildRecommendations, tallyLogsByExercise } from "./lib/recommendations.js";
import { loadState, persistState } from "./lib/storage.js";
import { TargetTable } from "./components/TargetTable.js";
import { ProgressList } from "./components/ProgressList.js";
import { WorkoutLogForm } from "./components/WorkoutLogForm.js";
import { RecommendationsList } from "./components/RecommendationsList.js";

const app = document.getElementById("app");

const state = initializeState();
render();
loadExercises();

function initializeState() {
  const stored = loadState();
  const targets = stored ? normalizeTargets(stored.targets) : DEFAULT_MUSCLE_TARGETS;
  const rawLogs = stored?.logs ?? [];
  const exercises = FALLBACK_EXERCISES;
  const logs = decorateLogs(rawLogs, exercises);

  return {
    targets,
    rawLogs,
    logs,
    exercises,
    volume: summarizeLogs(logs, targets),
    isLoadingExercises: true,
    exerciseError: null,
  };
}

function render() {
  app.innerHTML = "";

  app.appendChild(renderHero());
  app.appendChild(renderTargetsSection());
  app.appendChild(renderProgressSection());
  app.appendChild(renderLogSection());
  app.appendChild(renderRecommendationsSection());
}

function renderHero() {
  const hero = document.createElement("section");
  hero.className = "section";
  hero.innerHTML = `
    <h1 style="font-size:1.5rem;margin:0 0 0.5rem;font-weight:700;">Lift Volume Planner</h1>
    <p style="margin:0;color:rgba(255,255,255,0.7);line-height:1.5;font-size:0.95rem;">
      Track weekly set targets by muscle group and get intelligent exercise suggestions when you're falling behind. Optimized for quick updates on the go.
    </p>
  `;
  return hero;
}

function renderTargetsSection() {
  const section = document.createElement("section");
  section.className = "section";
  section.innerHTML = `
    <h2>Weekly Targets</h2>
    <p class="description">Customize your per-muscle set goals. Changes are saved instantly.</p>
  `;

  const table = TargetTable({
    targets: state.targets.map((target) => ({
      ...target,
      volume: state.volume[target.id] ?? 0,
    })),
    onUpdate: handleTargetUpdate,
  });

  section.appendChild(table);
  return section;
}

function renderProgressSection() {
  const section = document.createElement("section");
  section.className = "section";
  section.innerHTML = `
    <h2>Volume Progress</h2>
    <p class="description">Primary sets count as 1.0 · Secondary sets count as 0.5.</p>
  `;

  const progress = computeProgress(state.volume, state.targets);
  section.appendChild(ProgressList({ items: progress }));
  return section;
}

function renderLogSection() {
  const section = document.createElement("section");
  section.className = "section";
  section.innerHTML = `
    <h2>Log Sets</h2>
    <p class="description">Add a workout and we'll update every muscle automatically.</p>
  `;

  section.appendChild(
    WorkoutLogForm({
      onSubmit: handleLogSubmission,
      exercises: state.exercises,
    })
  );

  const status = renderExerciseStatus();
  if (status) {
    section.appendChild(status);
  }

  if (state.logs.length) {
    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "0.75rem";
    list.style.marginTop = "1rem";

    state.logs
      .slice()
      .reverse()
      .slice(0, 5)
      .forEach((log) => {
        const item = document.createElement("div");
        item.className = "suggestion-card";
        item.innerHTML = `
          <strong>${log.exercise.name}</strong>
          <span style="font-size:0.85rem;color:rgba(255,255,255,0.6);">${log.sets} sets · ${log.reps} reps · ${new Date(log.performedAt).toLocaleString()}</span>
        `;
        list.appendChild(item);
      });

    section.appendChild(list);
  }

  return section;
}

function renderRecommendationsSection() {
  const section = document.createElement("section");
  section.className = "section";
  section.innerHTML = `
    <h2>Recommendations</h2>
    <p class="description">We'll highlight muscle groups below 90% of target and suggest the top 3 lifts to close the gap.</p>
  `;

  const progress = computeProgress(state.volume, state.targets);
  const recs = buildRecommendations(
    progress,
    tallyLogsByExercise(state.logs),
    state.exercises
  );
  section.appendChild(RecommendationsList({ items: recs }));

  if (state.isLoadingExercises || state.exerciseError) {
    const status = renderExerciseStatus();
    if (status) {
      section.appendChild(status);
    }
  }
  return section;
}

function handleTargetUpdate(muscleId, newTarget) {
  state.targets = state.targets.map((muscle) =>
    muscle.id === muscleId ? { ...muscle, target: Number(newTarget) } : muscle
  );
  persistState({
    targets: state.targets,
    logs: state.rawLogs,
  });
  render();
}

function handleLogSubmission(payload) {
  const exercise = resolveExerciseById(payload.exerciseId);
  if (!exercise) return;

  const logEntry = {
    ...payload,
    exercise,
  };
  state.logs.push(logEntry);
  state.rawLogs.push({
    exerciseId: payload.exerciseId,
    sets: payload.sets,
    reps: payload.reps,
    performedAt: payload.performedAt,
  });
  state.volume = accumulateSet(state.volume, exercise, payload.sets);

  persistState({
    targets: state.targets,
    logs: state.rawLogs,
  });

  render();
}

async function loadExercises() {
  try {
    const remoteExercises = await fetchExercisesFromApi();
    state.exercises = mergeExerciseCatalog(remoteExercises, FALLBACK_EXERCISES);
    state.exerciseError = null;
  } catch (error) {
    state.exerciseError = error?.message ?? "Failed to load exercises";
  } finally {
    state.isLoadingExercises = false;
    state.logs = decorateLogs(state.rawLogs, state.exercises);
    state.volume = summarizeLogs(state.logs, state.targets);
    render();
  }
}

function decorateLogs(rawLogs, exercises) {
  return rawLogs.map((log) => {
    const exercise = exercises.find((item) => item.id === log.exerciseId);
    return {
      ...log,
      exercise:
        exercise ?? {
          id: log.exerciseId,
          name: log.exerciseId,
          modality: "Unknown",
          type: "Unknown",
          primaryMuscles: [],
          secondaryMuscles: [],
        },
    };
  });
}

function renderExerciseStatus() {
  if (state.isLoadingExercises) {
    const notice = document.createElement("p");
    notice.className = "description";
    notice.textContent = "Loading live exercise catalog…";
    return notice;
  }

  if (state.exerciseError) {
    const notice = document.createElement("p");
    notice.className = "description";
    notice.style.color = "#f8d7da";
    notice.textContent = `Using offline catalog. ${state.exerciseError}`;
    return notice;
  }

  return null;
}

function resolveExerciseById(exerciseId) {
  return state.exercises.find((item) => item.id === exerciseId);
}

function mergeExerciseCatalog(remote, fallback) {
  const map = new Map();
  fallback.forEach((exercise) => {
    map.set(exercise.id, exercise);
  });
  remote.forEach((exercise) => {
    map.set(exercise.id, exercise);
  });
  return Array.from(map.values());
}
