# Lift Volume Planner

A mobile-first web application that mirrors key functionality from training trackers like Liftoff, Strong, and Hevy while adding explicit weekly set-volume targets per muscle group. The interface is designed to run without a build step, making it easy to preview by opening `public/index.html` in any browser.

## Features

- Configure weekly set goals for each tracked muscle group, including a vertical/horizontal back split.
- Log workouts with automatic volume accumulation (primary muscles count as 1.0 set, secondary muscles as 0.5).
- Visualize progress toward each goal with responsive progress bars optimized for phone screens.
- Receive exercise recommendations when a muscle group falls below 90% of its target volume.
- Persistent storage using the browser's `localStorage` so your program and logs remain available between sessions.

## Project Structure

```
public/
  index.html        # Entry point for the client-side application
src/
  app.js            # Application bootstrap and rendering logic
  data/
    muscleGroups.js # Default muscle group definitions and metadata
    exercises.js    # Exercise catalog with primary/secondary muscle mapping
  lib/
    volumeTracking.js    # Core accumulation and normalization helpers
    recommendations.js   # Gap analysis and exercise suggestion engine
    storage.js           # Local storage utilities
  components/
    TargetTable.js         # Editable target table UI
    ProgressList.js        # Progress bar renderer
    WorkoutLogForm.js      # Workout logging form
    RecommendationsList.js # Recommendations display cards
styles.css
```

## Running Locally

Because the project does not rely on a bundler, you can open the `public/index.html` file directly in your browser. For a local development server with automatic reloading you can use Python's built-in HTTP server:

```bash
python -m http.server 3000
```

Then navigate to `http://localhost:3000/public/index.html`.

## Next Steps

- Replace the static exercise catalog with live data from [JigsawProphet/fitness-api](https://github.com/JigsawProphet/fitness-api) once network access is configured.
- Introduce user accounts and sync targets/logs to a backend service for multi-device support.
- Expand the recommendation engine with muscle fatigue management and progression insights.
