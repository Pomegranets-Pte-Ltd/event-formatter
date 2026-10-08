# Event Formatter

Turning event deployment details into a consistent, copy-ready group chat update.

## Features

- E3000, AER2200, Peplink, and SOHO router options
- Round Robin, Spillover, and NA modes; SOHO messages omit the mode
- One local speed-test image per router from file or clipboard, with cropping and a copyable combined image and caption
- Router details in the event message, including mounting location when provided
- Optional provider, collection, AP Cloud ID, location, and notes fields
- Repeatable SSID and password rows
- Form validation, formatted preview, and one-click copy
- A guided form that keeps optional router and event details collapsed until needed
- Quick actions below Notes, with deployment and collection suggestions (including collection-only "No issues")
- Responsive layout with no backend or external data storage
- Clickable footer version with the latest 30 Git commit messages and dates

## Version and change history

The footer uses the build's short Git commit ID as its version. Click it to expand
the recent commit history. Vite reads this information locally at startup/build
time and includes it in the site; visitors do not need access to GitHub. Commit
subjects appear as written, so use clear messages describing what changed.

GitHub Pages checks out the full history so deployments include previous commits.
Uncommitted work is marked as local changes and appears in the history only after
it is committed and rebuilt. Restart the dev server after making new commits to
refresh the version. Builds without Git history display an unavailable message.

## Source layout

`src/App.jsx` is the entry point. The formatter is organized into four main UI files:

- `pages/EventFormatter.jsx` owns form state, validation, and event handlers.
- `components/RouterSection.jsx` renders router settings and image inputs.
- `components/EventDetails.jsx` renders Wi-Fi, collection details, notes, and quick action text.
- `components/GeneratedResults.jsx` renders event messages and router results.

The existing image preview and crop dialog live in `components/`. Message formatting, clipboard helpers, and combined result image generation live in `utils/`.

### Built for Pomegranets internal usage.
