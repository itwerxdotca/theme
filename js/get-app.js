/**
 * @file
 * "Get the app" modal (#getAppModal in page.html.twig).
 *
 * - Never runs in the installed app.
 * - Opens by itself once per phone or tablet: on Android when the browser
 *   offers to install; on iPhone and iPad straight away, showing the Share
 *   steps (Safari has no install prompt). Never by itself on a computer.
 * - Opens every time a link or button marked data-app-only is tapped.
 * - The app icon is the Install button: when the browser offers to install,
 *   the icon is switched on, and tapping it presses the PWA module's own
 *   (hidden) Install button, which opens the browser's install prompt.
 */
(function (Drupal, once) {
  'use strict';

  const KEY = 'tcGetAppShown';
  const installed = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Phones and tablets: a touch screen as the main pointer.
  const mobile = window.matchMedia('(pointer: coarse)').matches;

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
        const icon = el.querySelector('.get-app-icon');
        const moduleButton = () => el.querySelector('.tc-install > button');

        // The PWA module adds its button when the browser offers to install;
        // wait a moment so its handler has run, then switch the icon on.
        window.addEventListener('beforeinstallprompt', () => {
          setTimeout(() => {
            if (moduleButton()) {
              icon.disabled = false;
            }
          });
        });
        icon.addEventListener('click', () => {
          const button = moduleButton();
          if (button) {
            button.click();
          }
        });
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
        else if (mobile) {
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
