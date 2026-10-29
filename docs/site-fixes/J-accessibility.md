# J: Accessibility and interaction repairs

Recon map: existing native dialogs, form templates, Circles canvas and shared pale glass styles are retained. The scoped support layer adds semantic labels and focus behavior without adding close buttons to Circles cards.

Dialogs expose one Close control, an associated heading, modal semantics, native Escape support, Tab containment and focus return. Browser testing of the actual artwork report dialog confirms a required five-option reason, optional details, submit disabled until selection, one Close button, focus inside the dialog and return to its original Report trigger after Escape. Standalone artwork pages now supply that actual report dialog rather than an orphaned button.

Required fields are marked and announced, invalid-field messages are linked by aria-describedby, and errors clear as fields are repaired. Honeypots remain outside keyboard/accessibility order. Skip links are inside the header landmark, feed/filter groups have valid semantics, duplicate contentinfo landmarks were removed and Home workshop headings no longer skip a level. Footer muted text changed from #657187/#758195 to #50617a on the existing pale background to meet AA; the visual identity remains intact. Visible focus and reduced-motion rules are scoped to Communiverse.

At 375px, axe-core with WCAG 2 A/AA, WCAG 2.1 AA and best-practice rules found these violation-rule counts before and after:

| Page | Live v25 before | Local candidate after |
| --- | ---: | ---: |
| Home | 3 | 0 |
| Workshops | 2 | 0 |
| Circles | 1 | 0 |
| Artist (Sophiko) | 2 | 0 |

Axe cannot determine contrast over gradients automatically. The remaining incomplete contrast checks need visual/token review, not a claim of a perfect score. Sampled foreground tokens exceed 4.5:1 against a conservative composite of the existing pale body gradients. Images, icon states and all dynamic combinations still require ongoing human review. Lighthouse numeric Accessibility/SEO/Best Practices scores were not measured by this browser tool; no 95+ result is claimed. The plan permits axe as the alternative audit.

Build/lint and 28 tests pass, including real Worker assertions for report controls, required-field semantics, valid client routes and retained Escape behavior. Full responsive screenshots, catalogue crawl and the final fourteen-person Circles geometry/motion check follow K and are recorded in the release verification packet.

Needs human input: human review of glass/image contrast and the requested visual assets. Production acceptance and account/provider gates remain open.
