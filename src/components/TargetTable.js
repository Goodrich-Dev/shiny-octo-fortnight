import { MUSCLE_GROUP_METADATA } from "../data/muscleGroups.js";

export function TargetTable({ targets, onUpdate }) {
  const rows = targets
    .map((muscle) => {
      const metadata = MUSCLE_GROUP_METADATA[muscle.id] ?? {};
      return `
        <tr>
          <td>
            <div class="progress-label">
              <span>${muscle.label}</span>
              <span class="badge" style="background:${withAlpha(metadata.color, 0.12)};color:${metadata.color}">
                Target ${muscle.target}
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${Math.min(
                (muscle.volume ?? 0) / (muscle.target || 1) * 100,
                125
              )}%"></div>
            </div>
          </td>
          <td style="text-align:right;">
            <input type="number" step="0.5" min="0" value="${muscle.target}" data-id="${muscle.id}" />
          </td>
        </tr>
      `;
    })
    .join("\n");

  const table = document.createElement("table");
  table.className = "table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Muscle Group</th>
        <th style="text-align:right">Sets/Wk</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  `;

  table.addEventListener("change", (event) => {
    const input = event.target;
    if (input.matches("input[data-id]")) {
      const value = Number(input.value);
      onUpdate?.(input.dataset.id, isFinite(value) ? value : 0);
    }
  });

  return table;
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
