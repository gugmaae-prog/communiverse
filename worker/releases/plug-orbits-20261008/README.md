# Small animated mobile orbits

Below 760px, Plug uses independent profile, video, craft-detail, social and gallery surfaces within its constellation. The previous fixed bottom tray is removed. Cards and the video move with the selected orb through the existing 640ms interruptible transition; switching people starts card movement from the most recent painted pose. Content is available immediately. The selected orb, peers and surfaces remain bounded horizontally. Card geometry does not add a vertical offset to all portraits or determine the mobile scene height.

Videos are frame-free, with curved edges and controls. Their width is at most 104px, scaled to the actual field width. Profile cards are 128px tall and detail cards 160px, with internal scrolling; below 650px viewport height those become 112px and 144px. The gallery action stays outside the cards. Social marks remain independent and use targets of at least 44px. Mobile scene scrolling clears both fixed navigation rows using a 148px scroll margin. Desktop layout and its 176px video retain the prior geometry.

The existing reduced-motion, keyboard, Escape, close, filter, history, media-pause and document lifecycle behavior remains. Reduced motion snaps directly to the final pose and pauses video. No continuous idle animation, new framework, library, data or media is introduced.

This Plug-only wrapper imports the exact current navigation runtime. All seventeen previous modules remain identical; three presentation modules are added. Galleries, request forms, four-tab navigation, people, the original glass clip, legacy service/D1 bindings, runtime settings and immutable prior assets remain. Assemble using scripts/prepare-plug-orbits.mjs against a fresh verified current capture, never the legacy Next build.
