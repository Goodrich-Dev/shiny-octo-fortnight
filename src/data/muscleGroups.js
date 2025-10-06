export const DEFAULT_MUSCLE_TARGETS = [
  { id: "chest", label: "Chest", target: 13 },
  { id: "shoulders", label: "Shoulders", target: 12 },
  { id: "triceps", label: "Triceps", target: 13.5 },
  { id: "verticalBack", label: "Vertical Back", target: 12 },
  { id: "horizontalBack", label: "Horizontal Back", target: 7.5 },
  { id: "biceps", label: "Biceps", target: 10.5 },
  { id: "quads", label: "Quads", target: 12 },
  { id: "glutes", label: "Glutes", target: 9 },
  { id: "hamstrings", label: "Hamstrings", target: 7.5 },
  { id: "abs", label: "Abs", target: 12 },
];

export const MUSCLE_GROUP_METADATA = {
  chest: {
    color: "#f472b6",
    description: "Pressing and fly movements for upper body pushing strength.",
  },
  shoulders: {
    color: "#fb923c",
    description: "Deltoid development across overhead and lateral movement patterns.",
  },
  triceps: {
    color: "#facc15",
    description: "Elbow extension work that complements pressing strength.",
  },
  verticalBack: {
    color: "#38bdf8",
    description: "Vertical pulling volume such as pull-ups and pulldowns.",
  },
  horizontalBack: {
    color: "#22d3ee",
    description: "Horizontal rowing and scapular retraction exercises.",
  },
  biceps: {
    color: "#a855f7",
    description: "Curling movements targeting elbow flexors.",
  },
  quads: {
    color: "#4ade80",
    description: "Knee-dominant lower body lifts like squats and split squats.",
  },
  glutes: {
    color: "#f97316",
    description: "Hip extension and abduction work for posterior chain strength.",
  },
  hamstrings: {
    color: "#14b8a6",
    description: "Hip hinge and leg curl variations to balance posterior chain.",
  },
  abs: {
    color: "#c084fc",
    description: "Core stability and flexion exercises for trunk control.",
  },
};
