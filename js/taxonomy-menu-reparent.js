/**
 * Taxonomy menu — mobile flyout reparenting.
 *
 * Bootstrap's own dropdown behaviors (data-bs-toggle="dropdown") continue
 * to handle click/tap, keyboard, and .show toggling exactly as-is. This
 * script does NOT reimplement any of that.
 *
 * It only solves one problem: on mobile, the nav strip needs
 * overflow-x: auto for swipe, and CSS cannot exempt a floating dropdown
 * from being clipped by that ancestor. So while a dropdown is open, this
 * moves that specific menu node to <body> and positions it under its
 * trigger, then moves it back to its original spot when closed.
 *
 * Hooks only Bootstrap's native events (show.bs.dropdown / hide.bs.dropdown) —
 * no custom open/close state of its own.
 */
(function () {
  'use strict';

  var MOBILE_QUERY = '(max-width: 768px)';

  function isMobile() {
	return window.matchMedia(MOBILE_QUERY).matches;
  }

  function position(menu, trigger) {
	// Captured once, at open time, from the trigger's position — then the
	// menu is centered in the viewport rather than re-anchored to the
	// trigger. This is deliberate: if the nav strip is swiped after the
	// menu opens, the trigger moves out from under it, and continuously
	// re-tracking the trigger made the menu jump or appear to close.
	// Centering in the viewport means later scrolling can't move it at all.
	var rect = trigger.getBoundingClientRect();
	var top = rect.bottom + 4;

	menu.style.position = 'fixed';
	menu.style.top = Math.max(top, 4) + 'px';
	menu.style.left = '50%';
	menu.style.transform = 'translateX(-50%)';
	menu.style.zIndex = '1000';
	menu.style.margin = '0';
  }

  function reset(menu) {
	menu.style.position = '';
	menu.style.top = '';
	menu.style.left = '';
	menu.style.transform = '';
	menu.style.zIndex = '';
	menu.style.margin = '';
  }

  document.addEventListener('show.bs.dropdown', function (e) {
	if (!isMobile()) return;

	var trigger = e.target; // element with data-bs-toggle="dropdown"
	var menu = trigger.nextElementSibling;
	if (!menu || !menu.classList.contains('dropdown-menu')) return;
	if (!trigger.closest('.hierarchical-taxonomy-menu')) return;

	menu._homeParent = menu.parentNode;
	menu._homeNextSibling = menu.nextSibling;
	menu._trigger = trigger;

	// Wrap in a marker element carrying the .hierarchical-taxonomy-menu
	// class. Without this, moving `menu` directly to <body> breaks every
	// descendant selector (.hierarchical-taxonomy-menu .dropdown-item,
	// .category-icon, etc.) since .hierarchical-taxonomy-menu is no
	// longer an ancestor once the menu leaves that DOM subtree.
	var wrapper = document.createElement('div');
	wrapper.className = 'hierarchical-taxonomy-menu taxonomy-menu-flyout-wrapper';
	wrapper.style.position = 'static'; // wrapper itself is unstyled; menu keeps its own position:fixed
	document.body.appendChild(wrapper);
	wrapper.appendChild(menu);
	menu._wrapper = wrapper;

	position(menu, trigger);
	menu.style.maxWidth = 'calc(100vw - 1rem)'; // preserve the clamp the mobile CSS used to provide

	// Intentionally NOT re-positioning on scroll — that was the cause of
	// the menu jumping/appearing to close as the nav strip was swiped.
	// Only re-run on resize (e.g. device rotation), a genuine layout change.
	menu._reposition = function () {
	  position(menu, trigger);
	};
	window.addEventListener('resize', menu._reposition);
  });

  document.addEventListener('hide.bs.dropdown', function (e) {
	var trigger = e.target;
	var menu = trigger.nextElementSibling;

	// menu may already have been moved into a wrapper under <body>; find it there if needed
	if (!menu || !menu._wrapper) {
	  menu = document.querySelector(
		'.taxonomy-menu-flyout-wrapper .dropdown-menu[style*="position: fixed"]'
	  );
	}
	if (!menu || !menu._homeParent) return;

	if (menu._reposition) {
	  window.removeEventListener('resize', menu._reposition);
	  menu._reposition = null;
	}

	reset(menu);
	menu.style.maxWidth = '';

	if (menu._homeNextSibling) {
	  menu._homeParent.insertBefore(menu, menu._homeNextSibling);
	} else {
	  menu._homeParent.appendChild(menu);
	}

	if (menu._wrapper && menu._wrapper.parentNode) {
	  menu._wrapper.parentNode.removeChild(menu._wrapper);
	}
	menu._wrapper = null;
	menu._homeParent = null;
	menu._homeNextSibling = null;
  });
})();