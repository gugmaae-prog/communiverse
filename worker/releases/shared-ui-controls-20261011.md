# Shared close/delete controls and avatar-only profile — 2026-10-11

Communiverse accumulated text and glyph close controls, text deletion actions,
and a visible account name beside the header avatar on public pages. The new
shared presentation layer makes close controls X icons, deletion/removal actions
trash icons, and the top-right profile link an avatar only.

The original button nodes, listeners, data IDs, form values, disabled/hidden
states and confirmation forms are retained. Icon buttons have accessible names,
tooltips, decorative SVGs and 44px circular hit areas. Ordinary save, follow,
heart, cancel-meeting, discard-draft and hide-date actions keep their meaning.
Only name spans inside the header account chip are hidden; profile content and
sign-in/join text remain visible.

## Sweep coverage

- Workspace, artist story, artwork, report, item and Plug profile dialogs.
- Work/assistant, circle editor, invitation and composer dismissal controls.
- Toast dismissal and expandable artist stories, including return to open state.
- Account/content management deletion and permanent-deletion confirmation.
- Own posts/comments/events, circle posts, gallery removal and signup removal.
- Cosmos plan-step removal, late-rendered dialogs and account hydration.

The observer inspects changed subtrees rather than rescanning the whole page.
The initializer uses its own `data-cv-ui-controls` marker, coexisting with Plug's
older `data-cv-controls` initializer. SVGs do not intercept button hit testing.

## Runtime integration

The repository does not contain the complete retained marketplace runtime.
Do not replace production with its older Worker. Retain the active
`communiverse-marketplace` modules and their MIME types from `/content/v2`.

1. Copy `worker/shared-ui-controls.js` into runtime module `social-controls.txt`
   with MIME type `text/plain`.
2. Append `worker/shared-ui-controls.css` to runtime `social.css`.
3. Apply `worker/shared-ui-controls-entry.patch` to `social-entry.js`. It imports
   the script, serves the versioned UTF-8 JavaScript asset, and adds a deferred
   script to the shared HTML head. The asset uses the current social prefix so
   the workspace script filtering retains it.
4. Preserve all seven bindings, binary modules and compatibility settings.

The prior shared pill-button release remains present in production. This change
is independent of its source branch; it adds icon-only exceptions for the
specific close/delete actions and header avatar.

## Released version

- Worker: `communiverse-marketplace`
- Version: `56cbcb86-57e3-4a95-973d-cff9a3a22669`
- Deployment: `de5e9e82-b548-494e-86fc-a2ed7198275d`, 100% traffic
- Rollback before this UI change: `8277a67f-15bc-4bf3-b0c7-d4ae35e0cb40`
- Changed modules: `social-entry.js`, `social.css`
- Added module: `social-controls.txt`; 117 other modules byte-identical
- All seven bindings and compatibility date `2026-09-27` preserved

Validation: 15 browser regression checks including listener/form preservation,
hidden controls, story toggling, late insertion, re-rendering and legacy-marker
coexistence; 14 canonical routes and the script asset checked in a zero-traffic
preview and again at production traffic. Live desktop management showed 149
trash controls and the working X. Workspace and public Artists/Plug headers are
avatar-only. The 390px mobile request dialog fits without horizontal overflow
and its X remains 44px. No production forms were submitted or records deleted.

The retained browser fixture `worker/qa/shared-ui-controls.html` runs entirely
locally and reports its checks in `#results`.
