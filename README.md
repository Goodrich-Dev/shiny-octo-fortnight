# Lift Volume Planner

A mobile-first web application that mirrors key functionality from training trackers like Liftoff, Strong, and Hevy while adding explicit weekly set-volume targets per muscle group. The interface is designed to run without a build step, making it easy to preview by opening `index.html` in any browser.

## Features

- Configure weekly set goals for each tracked muscle group, including a vertical/horizontal back split.
- Log workouts with automatic volume accumulation (primary muscles count as 1.0 set, secondary muscles as 0.5).
- Visualize progress toward each goal with responsive progress bars optimized for phone screens.
- Receive exercise recommendations when a muscle group falls below 90% of its target volume, powered by the live catalog from [JigsawProphet/fitness-api](https://github.com/JigsawProphet/fitness-api) with an offline fallback.
- Persistent storage using the browser's `localStorage` so your program and logs remain available between sessions.

## Project Structure

```
index.html        # Entry point for the client-side application
src/
  app.js            # Application bootstrap and rendering logic
  data/
    muscleGroups.js # Default muscle group definitions and metadata
    exercises.js    # Exercise catalog fetcher and normalization helpers
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

Because the project does not rely on a bundler, you can open the `index.html` file directly in your browser. For a local development server with automatic reloading you can use Python's built-in HTTP server:

```bash
python -m http.server 3000
```

Then navigate to `http://localhost:3000/index.html`.

## Preparing for GitHub Pages

To test the site live on GitHub Pages without a build step:

1. Commit the latest changes to the `main` branch.
2. In your repository settings, open **Pages** and select **Deploy from a branch**.
3. Choose the `main` branch and set the folder to `/ (root)`.
4. Save the settings — GitHub will serve `index.html`, the `src/` modules, and `styles.css` directly.

Once the deployment finishes you can visit `https://<username>.github.io/<repo>/` to interact with the planner using the live exercise catalog.

## Exercise Catalog

When the application loads it requests up to 500 exercises from the hosted `fitness-api` deployment and normalizes muscle group labels to match the planner's vertical/horizontal back split. If the request fails (for example, because the device is offline), the UI transparently falls back to a curated local catalog so workout logging continues to function. Once network access is restored the live catalog will automatically replace the offline list without losing previously logged workouts.

## Next Steps

- Introduce user accounts and sync targets/logs to a backend service for multi-device support.
- Expand the recommendation engine with muscle fatigue management and progression insights.
