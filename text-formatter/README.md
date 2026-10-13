# Event Formatter

Turning event deployment details into a consistent, copy-ready group chat update.

## Features

- E3000, AER2200, Peplink, and SOHO router options
- Round Robin, Spillover, and NA modes; SOHO messages omit the mode
- Multiple speed-test results per router, each with an optional label (for example LAN or Wi-Fi via AP AB12)
- Separate file/clipboard image, crop, and copyable combined image and caption for each speed-test result
- Router details in the event message, including mounting location when provided
- Optional 8-port or 24-port switch per router, with an optional equipment ID
- Add or remove multiple access points per router, each with its own four-character AP Cloud ID
- Switch details and all AP IDs included in event updates and speed-test captions
- Optional provider, collection, location, and notes fields
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

`src/App.jsx` is the entry point. The formatter is organized into these UI files:

- `pages/EventFormatter.jsx` owns form state, validation, and event handlers.
- `components/RouterSection.jsx` renders router settings and image inputs.
- `components/RouterEquipment.jsx` renders each router's switch and repeatable AP inputs.
- `components/SpeedTestFields.jsx` renders repeatable, labelled speed-test image inputs.
- `components/EventDetails.jsx` renders Wi-Fi, collection details, notes, and quick action text.
- `components/GeneratedResults.jsx` renders event messages and router results.

The existing image preview and crop dialog live in `components/`. Message formatting, clipboard helpers, and combined result image generation live in `utils/`.

## Checks

Run `npm run lint`, `npm run build`, and
`node --test src/utils/messageFormatters.test.js scripts/buildInfo.test.js` from `text-formatter/`.

### Built for Pomegranets internal usage.
