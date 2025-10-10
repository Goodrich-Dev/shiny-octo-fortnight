import { MUSCLE_GROUP_METADATA } from "../data/muscleGroups.js";

export function RecommendationsList({ items }) {
  const container = document.createElement("div");
  container.className = "recommendations";

  if (!items.length) {
    const message = document.createElement("p");
    message.className = "no-data";
    message.textContent = "All muscle groups are on track. Keep it up!";
    container.appendChild(message);
    return container;
  }

  items.forEach(({ muscle, exercises }) => {
    const metadata = MUSCLE_GROUP_METADATA[muscle.id] ?? {};
    const card = document.createElement("div");
    card.className = "suggestion-card";
    card.innerHTML = `
      <h3>${muscle.label}</h3>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:0.9rem;">${muscle.volume.toFixed(
        1
      )} / ${muscle.target.toFixed(1)} sets logged</p>
      <div class="suggestion-meta">
        <span class="badge" style="background:${withAlpha(metadata.color, 0.18)};color:${metadata.color}">Need ${(muscle.target - muscle.volume).toFixed(1)} sets</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.45rem;">
        ${exercises
          .map(
            ({ exercise, recentSets }) => `
              <div style="display:flex;flex-direction:column;gap:0.25rem;">
                <strong style="font-size:0.95rem;">${exercise.name}</strong>
                <span style="font-size:0.8rem;color:rgba(255,255,255,0.55);">${exercise.modality} · ${exercise.type}${recentSets > 0 ? ` · Recently: ${recentSets} sets` : ""}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
    container.appendChild(card);
  });

  return container;
}

function withAlpha(hex, alpha) {
  if (!hex) return "rgba(255,255,255,0.2)";
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) return "rgba(255,255,255,0.2)";
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
