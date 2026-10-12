/**
 * @file
 * Ghost-text autocomplete: shows the rest of the first suggestion in grey
 * behind the input, as a hint.
 *
 * Accept the suggestion with the Right arrow or End key when the cursor is
 * at the end of the text. Tab is never intercepted, so keyboard users can
 * always move on to the next field (WCAG 2.1.2).
 *
 * Runs as a Drupal behavior so it also works on forms loaded by AJAX, such
 * as the ones in the login modal.
 */
((Drupal, once) => {
  'use strict';

  Drupal.behaviors.townscanadaGhostAutocomplete = {
    attach(context) {
      once('ghost-autocomplete', 'input.form-autocomplete', context).forEach((input) => {
        const autocompletePath = input.dataset.autocompletePath;
        if (!autocompletePath) {
          return;
        }

        const ghost = document.createElement('span');
        ghost.className = 'ghost-text-autocomplete';
        ghost.setAttribute('aria-hidden', 'true');
        Object.assign(ghost.style, {
          position: 'absolute',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: '10',
          whiteSpace: 'pre',
          display: 'none',
        });

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(ghost);

        const syncGhost = () => {
          const cs = getComputedStyle(input);
          Object.assign(ghost.style, {
            fontSize: cs.fontSize,
            fontFamily: cs.fontFamily,
            paddingLeft: cs.paddingLeft,
            lineHeight: cs.lineHeight,
            left: `${input.offsetLeft}px`,
            top: `${input.offsetTop}px`,
            width: `${input.offsetWidth}px`,
            height: `${input.offsetHeight}px`,
            paddingTop: cs.paddingTop,
          });
        };

        const hide = () => {
          ghost.textContent = '';
          ghost.style.display = 'none';
        };

        let controller = null;
        const fetchSuggestion = Drupal.debounce(() => {
          const val = input.value;
          if (!val) {
            hide();
            return;
          }
          if (controller) {
            controller.abort();
          }
          controller = new AbortController();
          fetch(`${autocompletePath}?q=${encodeURIComponent(val)}`, {
            credentials: 'same-origin',
            signal: controller.signal,
          })
            .then((response) => response.json())
            .then((data) => {
              const first = Array.isArray(data) && data.length ? data[0].value : '';
              // Ignore stale responses and non-prefix matches.
              if (
                input.value === val &&
                first &&
                first.toLowerCase().startsWith(val.toLowerCase()) &&
                first.toLowerCase() !== val.toLowerCase()
              ) {
                ghost.textContent = val + first.substring(val.length);
                ghost.style.display = 'block';
                syncGhost();
              }
              else {
                hide();
              }
            })
            .catch(() => {});
        }, 200);

        input.addEventListener('input', () => {
          hide();
          fetchSuggestion();
        });
        input.addEventListener('focus', syncGhost);
        window.addEventListener('resize', syncGhost);
        input.addEventListener('blur', hide);

        input.addEventListener('keydown', (e) => {
          const atEnd = input.selectionStart === input.value.length;
          if (
            (e.key === 'ArrowRight' || e.key === 'End') &&
            atEnd &&
            ghost.style.display === 'block' &&
            ghost.textContent
          ) {
            e.preventDefault();
            input.value = ghost.textContent;
            hide();
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          else if (e.key === 'Escape') {
            hide();
          }
        });
      });
    },
  };
})(Drupal, once);
