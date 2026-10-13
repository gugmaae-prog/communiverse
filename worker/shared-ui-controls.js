/* Presentation only: retain buttons, listeners, form semantics and data attributes. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.hasAttribute('data-cv-social') || root.dataset.cvUiControls) return;
  root.dataset.cvUiControls = '20261011';
  const closeSelector = [
    '.cv-modal-close', '.cv-dialog-close', '.glass-close', '[data-ws-dialog-close]',
    '[data-assistant-close]', '[data-close-work]', '[data-close-inline-artist]',
    '[data-close-circle-editor]', '[data-close-circle-invite]', '[data-dismiss-toast]',
    '[data-circle-compose-close]',
  ].join(',');
  const deleteSelector = [
    '[data-admin-delete]', '[data-remove][data-kind]', '[data-remove-circle-post]',
    '[data-ws-media-hide]', '.cv3-plan-remove', '[name="action"][value="remove"]',
    'form[data-admin-confirm] button',
  ].join(',');
  const records = new WeakMap();
  const paths = {
    close: 'M6 6l12 12M18 6 6 18',
    delete: 'M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6',
  };
  const clean = value => (value || '').replace(/[×✕✖]/g, '').replace(/\s+/g, ' ').trim();

  function iconButton(button) {
    const record = records.get(button);
    const text = clean(button.textContent);
    // Ignore our own ARIA label when a text toggle changes back to its open state.
    const aria = button.getAttribute('aria-label');
    const sourceAria = record && aria === record.label ? record.aria : aria;
    let kind = button.matches(closeSelector) ? 'close' : button.matches(deleteSelector) ? 'delete' : null;
    if (!kind && /^delete(?:\s|$)/i.test(text || sourceAria || '')) kind = 'delete';
    if (!kind && (/^close(?:\s|$)/i.test(text || sourceAria || '') || /^(?:×|✕|✖|x)$/i.test(button.textContent.trim()))) kind = 'close';
    if (!kind && !text && record && button.querySelector('[data-cv-control-glyph]')) return;
    if (!kind) {
      if (record) {
        button.removeAttribute('data-cv-ui-icon');
        if (aria === record.label) record.aria === null ? button.removeAttribute('aria-label') : button.setAttribute('aria-label', record.aria);
        if (button.title === record.label) record.title === null ? button.removeAttribute('title') : button.setAttribute('title', record.title);
        records.delete(button);
      }
      return;
    }
    if (record?.kind === kind && !text && button.querySelector('[data-cv-control-glyph]')) return;
    const label = text || sourceAria || (kind === 'close' ? 'Close' : 'Delete');
    const accessibleLabel = sourceAria && !/^(?:×|✕|✖|x)$/i.test(sourceAria) ? sourceAria : label;
    const saved = record || { aria, title: button.getAttribute('title') };
    saved.kind = kind;
    saved.label = accessibleLabel;
    records.set(button, saved);
    button.setAttribute('aria-label', accessibleLabel);
    button.setAttribute('title', accessibleLabel);
    button.setAttribute('data-cv-ui-icon', kind);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false', 'data-cv-control-glyph': kind })) svg.setAttribute(key, value);
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', paths[kind]);
    svg.append(path);
    button.replaceChildren(svg);
  }

  function profileChip(chip) {
    const name = Array.from(chip.children).find(child => child.matches('span:not(.cv-avatar)'))?.textContent.trim();
    const label = name ? 'Open your Communiverse profile · ' + name : chip.getAttribute('aria-label') || 'Open your Communiverse profile';
    if (chip.getAttribute('aria-label') !== label) chip.setAttribute('aria-label', label);
    if (chip.title !== 'Open profile') chip.title = 'Open profile';
  }

  function sweep(node) {
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) return;
    if (node.matches?.('button,[role="button"]')) iconButton(node);
    node.querySelectorAll('button,[role="button"]').forEach(iconButton);
    if (node.matches?.('#cv-social-header .cv-profile-chip')) profileChip(node);
    node.querySelectorAll('#cv-social-header .cv-profile-chip').forEach(profileChip);
  }
  sweep(document);
  // Inspect only changed subtrees; also handle late dialogs, account hydration,
  // toast dismissal, and story controls whose text changes when expanded.
  new MutationObserver(changes => {
    const nodes = new Set();
    for (const change of changes) {
      const target = change.target.nodeType === Node.ELEMENT_NODE ? change.target : change.target.parentElement;
      const button = target?.closest('button,[role="button"]');
      if (button) nodes.add(button);
      const chip = target?.closest('#cv-social-header .cv-profile-chip');
      if (chip) nodes.add(chip);
      for (const added of change.addedNodes) if (added.nodeType === Node.ELEMENT_NODE) nodes.add(added);
    }
    nodes.forEach(sweep);
  }).observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label'] });
})();
