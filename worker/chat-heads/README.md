# Floating Communiverse chat heads

Signed-in Communiverse pages expose up to three recent conversation avatars and a Messages launcher. An avatar opens one nonmodal floating window. There is no replacement full inbox. Existing Workspace conversation and new-conversation actions delegate to the same floating client.

Received messages use neutral bubbles and sender avatars; sent messages use blue bubbles on the right. The window supports message replies, shared-file downloads/uploads, a composer pinned below the scrollable message log, Enter to send, Shift+Enter for a newline, and Escape/minimize to return to the avatar. X dismisses the head without deleting data. Drafts and reply targets survive minimizing and switching threads during the current page session; they are cleared when authentication expires. Online, typing and recipient delivery states are not invented.

All reads and writes use the existing same-origin identity and participant-scoped Connect APIs. Sending and starting a conversation require an explicit user action. Send retries reuse the existing request key. Private messages are not put in URLs, HTML attributes, persistent storage or public assets. Existing 20 MB document/photo and 32 MB video limits are retained. The server returns its most recent 200 messages per thread.

Run `scripts/build-chat-marketplace.py SNAPSHOT OUTPUT` against a verified 122-module retained export. The build preserves 121 original modules including historic immutable workspace and glass assets, updates only the entry, and adds three text modules. It does not replace the retained backend or change routes, bindings, data tables, participant permissions or notifications.

`qa.html` and `qa.js` test synthetic conversations and mock writes only: draft isolation, replies, idempotent retries after a lost response, incoming updates, attachments, multiple participant selection, keyboard controls, escaped content, target sizes, layout and expired-session cleanup. Production verification opens existing conversations without sending test messages or uploading files.
