/**
 * @file
 * Keeps --header-h in sync with the fixed header's real rendered height,
 * and moves the listing category menu's panels out of its scrolling row
 * (see the second behavior below).
 *
 * The header's height isn't constant — the logo and icon sizes change at
 * breakpoints (see .navbar-brand img and .site-header i.la rules in
 * style.css), so anything offset from the header (hero top padding,
 * offcanvas top position) needs the *actual* height, not a fixed guess.
 * This sets --header-h on the root element so style.css can reference one
 * source of truth instead of separate hardcoded pixel values.
 */
(function (Drupal, once) {
  'use strict';

  function setHeaderHeightVar() {
  var header = document.querySelector('.site-header');
  if (!header) {
    return;
  }
  var height = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-h', height + 'px');
  }

  Drupal.behaviors.headerHeight = {
  attach: function (context) {
    once('header-height', 'body', context).forEach(function () {
    setHeaderHeightVar();

    var header = document.querySelector('.site-header');
    if (header && 'ResizeObserver' in window) {
      // Recalculates automatically on breakpoint changes, admin toolbar
      // toggling, or any future header content change — no media query
      // upkeep required.
      new ResizeObserver(setHeaderHeightVar).observe(header);
    }
    else {
      // Fallback for browsers without ResizeObserver.
      window.addEventListener('resize', setHeaderHeightVar);
      window.addEventListener('orientationchange', setHeaderHeightVar);
    }

    // Web fonts loading after first paint can shift text/icon size and
    // therefore header height — recheck once fonts are ready.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setHeaderHeightVar);
    }
    });
  }
  };

  /**
   * Listing category menu (hierarchical-taxonomy-menu.html.twig): moves each
   * category's subcategory panel out of the sideways-scrolling icon row to
   * just after it, inside the same block. Safari on iPhone clips or hides
   * anything inside a scrolling row, so the panel can't stay in it.
   * Bootstrap's dropdown is set up first, so it keeps opening and closing
   * the panel wherever it is. Panel styles: the menu section of style.css.
   */
  Drupal.behaviors.taxonomyMenuPanels = {
  attach: function (context) {
    var desktop = window.matchMedia('(min-width: 992px)');
    var hoverDesktop = window.matchMedia('(hover: hover) and (min-width: 992px)');
    once('taxonomy-menu-panels', '.hierarchical-taxonomy-menu.nav', context).forEach(function (row) {
    row.querySelectorAll(':scope > .nav-item > [data-bs-toggle="dropdown"]').forEach(function (toggle) {
      var panel = toggle.nextElementSibling;
      if (panel && panel.classList.contains('dropdown-menu')) {
      var dropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
      row.parentNode.appendChild(panel);
      // Desktop with a mouse: also open on hover, and close shortly after
      // the pointer leaves both the icon and its panel (the delay lets
      // it cross the gap between them).
      if (hoverDesktop.matches) {
        var closeTimer;
        var open = function () {
        clearTimeout(closeTimer);
        if (!panel.classList.contains('show')) {
          dropdown.show();
        }
        };
        var close = function () {
        closeTimer = setTimeout(function () { dropdown.hide(); }, 200);
        };
        [toggle.parentNode, panel].forEach(function (el) {
        el.addEventListener('mouseenter', open);
        el.addEventListener('mouseleave', close);
        });
      }
      // Desktop: centre the 16rem panel under its icon, kept within
      // the block. Phones: full width (the CSS default).
      toggle.addEventListener('shown.bs.dropdown', function () {
        if (!desktop.matches) {
        panel.style.left = '';
        return;
        }
        var block = row.closest('.block-hierarchical-taxonomy-menu').getBoundingClientRect();
        var icon = toggle.getBoundingClientRect();
        var left = icon.left + icon.width / 2 - block.left - panel.offsetWidth / 2;
        panel.style.left = Math.max(0, Math.min(left, block.width - panel.offsetWidth)) + 'px';
      });
      }
    });
    });
  }
  };

  /**
   * Front page "Show what's near me" button (page--front.html.twig).
   *
   * Asks for the location only when tapped. With a fix better than 1 km it
   * goes to /near-me/<lat>,<lng><=50km (View tc_near_me). If location is
   * refused, takes longer than 10 seconds or is too rough, it stays on the
   * page and says why in the status line under the button.
   */
  Drupal.behaviors.townscanadaNearMe = {
    attach: function (context) {
      once('tc-near-me', '[data-tc-near-me]', context).forEach(function (button) {
        var status = button.parentNode.querySelector('.tc-near-me-status');
        var say = function (text) {
          if (status) {
            status.textContent = text;
          }
        };

        button.addEventListener('click', function () {
          if (!('geolocation' in navigator)) {
            say(Drupal.t('This browser can\'t share your location. You can still search for a town above.'));
            return;
          }
          button.disabled = true;
          say(Drupal.t('Finding where you are…'));

          navigator.geolocation.getCurrentPosition(function (position) {
            var c = position.coords;
            if (c.accuracy > 1000) {
              button.disabled = false;
              say(Drupal.t('Your location is too rough to find places near you. Try again, or search for a town above.'));
              return;
            }
            window.location.href = Drupal.url('near-me/' + c.latitude.toFixed(4) + ',' + c.longitude.toFixed(4) + encodeURIComponent('<=50km'));
          }, function () {
            button.disabled = false;
            say(Drupal.t('We couldn\'t get your location. You can still search for a town above.'));
          }, {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000});
        });
      });
    }
  };

})(Drupal, once);
