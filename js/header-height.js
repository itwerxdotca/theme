/**
 * @file
 * Keeps --header-h in sync with the fixed header's real rendered height.
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

})(Drupal, once);