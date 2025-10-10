const API_BASE_URL = "https://fitness-api-git-main-jigsawprophets-projects.vercel.app/api";

const MUSCLE_ALIAS_ENTRIES = [
  ["chest", "chest"],
  ["pector", "chest"],
  ["upper chest", "upperChest"],
  ["shoulder", "shoulders"],
  ["deltoid", "shoulders"],
  ["rear delt", "rearDelts"],
  ["posterior delt", "rearDelts"],
  ["tricep", "triceps"],
  ["lat", "verticalBack"],
  ["latissimus", "verticalBack"],
  ["pull-up", "verticalBack"],
  ["pull down", "verticalBack"],
  ["upper back", "horizontalBack"],
  ["mid back", "horizontalBack"],
  ["trap", "horizontalBack"],
  ["trapezius", "horizontalBack"],
  ["rhomboid", "horizontalBack"],
  ["rear delt", "horizontalBack"],
  ["glute", "glutes"],
  ["hamstring", "hamstrings"],
  ["bicep", "biceps"],
  ["quadricep", "quads"],
  ["quad", "quads"],
  ["vastus", "quads"],
  ["ab", "abs"],
  ["core", "abs"],
  ["erector", "lowerBack"],
  ["lower back", "lowerBack"],
  ["hip flex", "hipFlexors"],
  ["forearm", "forearms"],
  ["calf", "calves"],
  ["gastrocnemius", "calves"],
  ["soleus", "calves"],
];

let cachedExercises;

export const FALLBACK_EXERCISES = [
  {
    id: "flat-bench-press",
    name: "Barbell Bench Press",
    modality: "Barbell",
    type: "Compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["shoulders", "triceps"],
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    modality: "Dumbbell",
    type: "Compound",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["shoulders", "triceps"],
  },
  {
    id: "overhead-press",
    name: "Standing Overhead Press",
    modality: "Barbell",
    type: "Compound",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps", "upperChest"],
  },
  {
    id: "lateral-raise",
    name: "Dumbbell Lateral Raise",
    modality: "Dumbbell",
    type: "Isolation",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: [],
  },
  {
    id: "skullcrusher",
    name: "EZ-Bar Skullcrusher",
    modality: "EZ Bar",
    type: "Isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    modality: "Bodyweight",
    type: "Compound",
    primaryMuscles: ["verticalBack"],
    secondaryMuscles: ["biceps", "shoulders"],
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    modality: "Cable",
    type: "Compound",
    primaryMuscles: ["verticalBack"],
    secondaryMuscles: ["biceps"],
  },
  {
    id: "seated-row",
    name: "Seated Cable Row",
    modality: "Cable",
    type: "Compound",
    primaryMuscles: ["horizontalBack"],
    secondaryMuscles: ["biceps"],
  },
  {
    id: "chest-supported-row",
    name: "Chest Supported Row",
    modality: "Dumbbell",
    type: "Compound",
    primaryMuscles: ["horizontalBack"],
    secondaryMuscles: ["biceps", "rearDelts"],
  },
  {
    id: "barbell-row",
    name: "Bent-Over Barbell Row",
    modality: "Barbell",
    type: "Compound",
    primaryMuscles: ["horizontalBack"],
    secondaryMuscles: ["biceps", "rearDelts", "verticalBack"],
  },
  {
    id: "barbell-squat",
    name: "Back Squat",
    modality: "Barbell",
    type: "Compound",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings"],
  },
  {
    id: "front-squat",
    name: "Front Squat",
    modality: "Barbell",
    type: "Compound",
    primaryMuscles: ["quads"],
    secondaryMuscles: ["upperBack"],
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    modality: "Barbell",
    type: "Compound",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lowerBack"],
  },
  {
    id: "hip-thrust",
    name: "Barbell Hip Thrust",
    modality: "Barbell",
    type: "Compound",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
  },
  {
    id: "leg-press",
    name: "Leg Press",
    modality: "Machine",
    type: "Compound",
    primaryMuscles: ["quads"],
    secondaryMuscles: ["glutes"],
  },
  {
    id: "leg-curl",
    name: "Seated Leg Curl",
    modality: "Machine",
    type: "Isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: [],
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    modality: "Machine",
    type: "Isolation",
    primaryMuscles: ["quads"],
    secondaryMuscles: [],
  },
  {
    id: "bicep-curl",
    name: "Dumbbell Curl",
    modality: "Dumbbell",
    type: "Isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: [],
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    modality: "Dumbbell",
    type: "Isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    modality: "Cable",
    type: "Isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: [],
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    modality: "Bodyweight",
    type: "Isolation",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["hipFlexors"],
  },
];

export async function fetchExercisesFromApi({ signal } = {}) {
  if (cachedExercises) {
    return cachedExercises;
  }

  const requestUrl = `${API_BASE_URL}/exercises?limit=500`;

  const response = await fetch(requestUrl, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load exercises: ${response.status}`);
  }

  const payload = await response.json();
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  const normalized = normalizeExerciseRecords(records);

  if (!normalized.length) {
    throw new Error("Received empty exercise catalog");
  }

  cachedExercises = normalized;
  return normalized;
}

export function mapExercisesById(exercises) {
  return exercises.reduce((acc, exercise) => {
    acc[exercise.id] = exercise;
    return acc;
  }, {});
}

export function findExercisesByMuscle(exercises, muscleId) {
  return exercises.filter((exercise) =>
    [...exercise.primaryMuscles, ...exercise.secondaryMuscles].includes(muscleId)
  );
}

function normalizeExerciseRecords(records) {
  return records
    .map((record) => normalizeExerciseRecord(record))
    .filter(Boolean);
}

function normalizeExerciseRecord(record) {
  const name = record?.name ?? record?.exercise ?? record?.title;
  if (!name) return null;

  const id = String(record?.id ?? record?.slug ?? slugify(name));
  const modality = record?.modality ?? record?.equipment ?? record?.tool ?? "Unknown";
  const type = record?.type ?? record?.category ?? record?.style ?? "Unknown";

  const primary = dedupe(
    normalizeMuscles(
      collectMuscleNames(record, [
        "primaryMuscles",
        "primary_muscles",
        "primeMovers",
        "targetMuscles",
        "agonists",
      ])
    )
  );

  const secondary = dedupe(
    normalizeMuscles(
      collectMuscleNames(record, [
        "secondaryMuscles",
        "secondary_muscles",
        "synergists",
        "stabilizers",
        "supportMuscles",
      ])
    )
  ).filter((muscle) => !primary.includes(muscle));

  if (!primary.length && !secondary.length) {
    return null;
  }

  return {
    id,
    name,
    modality,
    type,
    primaryMuscles: primary,
    secondaryMuscles: secondary,
  };
}

function collectMuscleNames(record, keys) {
  return keys
    .flatMap((key) => {
      const value = record?.[key];
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "string") return value.split(/[,/]/);
      return [];
    })
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function normalizeMuscles(names) {
  return names
    .map((name) => {
      const normalized = normalizeMuscleName(name);
      return normalized ? normalized : null;
    })
    .filter(Boolean);
}

function normalizeMuscleName(value) {
  const lower = value.toLowerCase();
  for (const [alias, target] of MUSCLE_ALIAS_ENTRIES) {
    if (lower.includes(alias)) {
      return target;
    }
  }
  return null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function dedupe(items) {
  return [...new Set(items)];
}
