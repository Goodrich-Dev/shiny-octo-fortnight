import { EXERCISES } from "../data/exercises.js";

export function WorkoutLogForm({ onSubmit }) {
  const form = document.createElement("form");
  form.className = "log-form";
  form.innerHTML = `
    <label class="full-width">
      <span style="display:block;margin-bottom:0.35rem;font-size:0.85rem;color:rgba(255,255,255,0.6);">Exercise</span>
      <select name="exercise" required>
        ${EXERCISES.map(
          (exercise) => `
            <option value="${exercise.id}">${exercise.name}</option>
          `
        ).join("\n")}
      </select>
    </label>
    <label>
      <span style="display:block;margin-bottom:0.35rem;font-size:0.85rem;color:rgba(255,255,255,0.6);">Sets</span>
      <input name="sets" type="number" step="1" min="1" value="3" required />
    </label>
    <label>
      <span style="display:block;margin-bottom:0.35rem;font-size:0.85rem;color:rgba(255,255,255,0.6);">Reps</span>
      <input name="reps" type="number" step="1" min="1" value="8" required />
    </label>
    <label>
      <span style="display:block;margin-bottom:0.35rem;font-size:0.85rem;color:rgba(255,255,255,0.6);">Date</span>
      <input name="performedAt" type="datetime-local" value="${defaultTimestamp()}" required />
    </label>
    <div class="full-width">
      <button type="submit" class="primary">Log Workout</button>
    </div>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      exerciseId: data.get("exercise"),
      sets: Number(data.get("sets")),
      reps: Number(data.get("reps")),
      performedAt: data.get("performedAt"),
    };
    onSubmit?.(payload);
    form.reset();
    form.querySelector("input[name='sets']").value = "3";
    form.querySelector("input[name='reps']").value = "8";
    form.querySelector("input[name='performedAt']").value = defaultTimestamp();
  });

  return form;
}

function defaultTimestamp() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}
