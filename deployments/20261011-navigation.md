# Communiverse navigation correction - 11 October 2026

Navigation was incorrectly decorated as radio choices by the shared glass helper. Workspace views, feed views and Plug filters now retain their original button semantics, labels, selected pill state and click handlers. Only form choices receive selection dots and radio keyboard support. Independent checkbox selections remain round and multiple.

Production marketplace version: `ce09801e-89fc-43cb-9805-1a901e5f48f4`.
Deployment: `583fff05-6717-4da8-b5e9-418318929794`, 100% traffic.

The incremental release retained 120 original modules byte-for-byte, changed only `social-entry.js`, and added `social-navigation.txt`. The prior immutable glass asset remains available with its original bytes. New HTML loads `/communiverse/_public/20261011-navigation.js`.

Validation: all 12 control fixture checks passed. Zero-traffic and production HTTP checks passed for Plug, feed and Workspace and both old/new script assets. Browser checks confirmed zero navigation dots and radio roles, functioning Plug/Workspace/feed switching, and no horizontal overflow on Plug at 1280px and 390px. Production bindings and runtime settings matched the pre-release snapshot.
