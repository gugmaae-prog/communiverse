# Floating Messenger-style chat heads - 11 October 2026

The user selected floating avatar chat heads only. The existing Messages list remains available; its conversation and new-conversation actions open the floating client instead of the generic workspace dialog.

Signed-in Communiverse pages show up to three recent conversation avatars and a compact Messages launcher. Each opens one nonmodal window with neutral received bubbles, blue sent bubbles, a scrollable log, pinned composer, replies and shared files. Enter sends; Shift+Enter inserts a newline. Minimize/Escape keep the chat head and draft. X dismisses the head without deleting data. Drafts stay isolated by thread during the page session. Online, typing and recipient delivery statuses are not fabricated.

## Live deployment

- Worker: `communiverse-marketplace`
- Version: `d435fbb7-fe90-432b-9908-56c13c1bec3d`
- Deployment: `97785cd5-a65b-4f8d-b82c-e35cab638ce2`
- Traffic: 100%
- New client: `/communiverse/_public/20261011-chat-heads.js`
- Workspace integration: `/communiverse/_public/20261011-workspace-chat-heads.js`

The build retains 121 original modules byte-for-byte, changes the entry and adds three text modules. Historic immutable assets remain available. Backend APIs, participant authorization, bindings, runtime settings, routes and stored data were not modified. The shared style is inline; the final correction changed its avatar and grid sizing without changing immutable script bytes.

## Verification

- 33 synthetic interaction checks at 319px, 389px and 1280px: 99 passes. Covers escaped text, replies, per-thread drafts, idempotent send retry after a lost response, incoming polling, authenticated file links/uploads, multiple participant selection, keyboard controls, 44px targets, regular typography, circular avatars, internal/window overflow and expired-session cleanup.
- 14 zero-traffic and 14 production HTTP checks: seven page families, current/historic assets and anonymous private-data boundaries.
- Live Plug at desktop and 390px: avatar 36 by 36, no page or chat overflow; existing conversations opened without sending messages.
- Live Workspace: existing conversation and new-conversation actions open the floating window; the legacy dialog stays closed.
- Full retained module bytes/types and production settings/bindings compared with the candidate and pre-release snapshot.

No production test message, conversation creation or file upload was performed. Those write paths were checked against synthetic data. Existing server limits remain: most recent 200 messages returned per thread; up to 100 conversation records; incoming messages refresh on the existing 20-second cadence while the page is visible. Drafts are page-session memory, not persistent storage.

## Rollback

The pre-chat version is `ce09801e-89fc-43cb-9805-1a901e5f48f4`. Reconcile any newer production changes before changing traffic. No data migration needs reversal.
