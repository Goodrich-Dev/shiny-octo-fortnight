import { MUSCLE_GROUP_METADATA } from "../data/muscleGroups.js";

export function ProgressList({ items }) {
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "no-data";
    empty.textContent = "No training volume logged yet.";
    return empty;
  }

  const container = document.createElement("div");
  container.className = "progress-list";

  items.forEach((item) => {
    const metadata = MUSCLE_GROUP_METADATA[item.id] ?? {};
    const group = document.createElement("div");
    group.className = "progress-group";
    group.innerHTML = `
      <div class="progress-label">
        <span>${item.label}</span>
        <span>${item.volume.toFixed(1)} / ${item.target.toFixed(1)} sets</span>
      </div>
      <div class="progress-bar" style="background:${withAlpha(metadata.color, 0.18)}">
        <div class="progress-fill" style="width:${Math.min(
          item.completion,
          125
        )}%;background:${metadata.color ?? "#6366f1"}"></div>
      </div>
    `;
    container.appendChild(group);
  });

  return container;
}

function withAlpha(hex, alpha) {
  if (!hex) return "rgba(99,102,241,0.15)";
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) return "rgba(99,102,241,0.15)";
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
