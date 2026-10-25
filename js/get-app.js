/**
 * @file
 * "Get the app" modal (#getAppModal in page.html.twig).
 *
 * - Never runs in the installed app.
 * - Opens by itself once per device: on Android and desktop Chrome/Edge
 *   when the browser offers to install; on iPhone and iPad straight away,
 *   showing the Share steps (Safari has no install prompt).
 * - Opens every time a link or button marked data-app-only is tapped.
 */
(function (Drupal, once) {
  'use strict';

  const KEY = 'tcGetAppShown';
  const installed = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function shownBefore() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function markShown() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  }

  Drupal.behaviors.tcGetApp = {
    attach(context) {
      once('tc-get-app', '#getAppModal', context).forEach((el) => {
        if (installed) {
          return;
        }
        const modal = bootstrap.Modal.getOrCreateInstance(el);
        const openOnce = () => {
          if (!shownBefore()) {
            markShown();
            modal.show();
          }
        };

        if (ios) {
          el.querySelector('.get-app-ios').classList.remove('d-none');
          openOnce();
        }
        else {
          window.addEventListener('beforeinstallprompt', openOnce);
        }

        document.addEventListener('click', (e) => {
          if (e.target.closest('[data-app-only]')) {
            e.preventDefault();
            modal.show();
          }
        });
      });
    },
  };
})(Drupal, once);
