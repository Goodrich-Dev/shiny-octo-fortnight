import { DEFAULT_MUSCLE_TARGETS } from "./data/muscleGroups.js";
import { EXERCISES } from "./data/exercises.js";
import {
  accumulateSet,
  computeProgress,
  createEmptyVolumeState,
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

function initializeState() {
  const stored = loadState();
  if (!stored) {
    return {
      targets: DEFAULT_MUSCLE_TARGETS,
      logs: [],
      volume: createEmptyVolumeState(),
    };
  }

  const targets = normalizeTargets(stored.targets);
  const logs = stored.logs?.map((log) => ({
    ...log,
    exercise: EXERCISES.find((exercise) => exercise.id === log.exerciseId) ??
      EXERCISES[0],
  })) ?? [];

  return {
    targets,
    logs,
    volume: summarizeLogs(logs, targets),
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
    })
  );

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
  const recs = buildRecommendations(progress, tallyLogsByExercise(state.logs));
  section.appendChild(RecommendationsList({ items: recs }));
  return section;
}

function handleTargetUpdate(muscleId, newTarget) {
  state.targets = state.targets.map((muscle) =>
    muscle.id === muscleId ? { ...muscle, target: Number(newTarget) } : muscle
  );
  persistState({
    targets: state.targets,
    logs: state.logs.map((log) => ({
      exerciseId: log.exercise.id,
      sets: log.sets,
      reps: log.reps,
      performedAt: log.performedAt,
    })),
  });
  render();
}

function handleLogSubmission(payload) {
  const exercise = EXERCISES.find((item) => item.id === payload.exerciseId);
  if (!exercise) return;

  const logEntry = {
    ...payload,
    exercise,
  };
  state.logs.push(logEntry);
  state.volume = accumulateSet(state.volume, exercise, payload.sets);

  persistState({
    targets: state.targets,
    logs: state.logs.map((log) => ({
      exerciseId: log.exercise.id,
      sets: log.sets,
      reps: log.reps,
      performedAt: log.performedAt,
    })),
  });

  render();
}
