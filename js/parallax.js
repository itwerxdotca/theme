/**
 * Parallax for hero-region (center-anchored).
 * Works with current Twig/CSS:
 *  - If .hero-media contains an <img>, translate .hero-media
 *  - If .hero-region has background-image, animate background-position (clamped to avoid top gap)
 *
 * Controls:
 *  - data-parallax="true"
 *  - data-parallax-speed (default 0.18)
 *  - Disable under PARALLAX_BREAKPOINT (default 1024px)
 *  - Respects prefers-reduced-motion
 */
(function () {
  'use strict';

  var PARALLAX_BREAKPOINT = 1024;
  var SCALE_BREAKPOINT = 768;
  var DEFAULT_SPEED = 0.18;
  var DEBOUNCE_MS = 120;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heroes = Array.prototype.slice.call(document.querySelectorAll('.hero-region'));
  if (!heroes.length) return;

  var parallaxHeroes = heroes.filter(function (h) {
    return h.getAttribute('data-parallax') === 'true';
  });

  var activeParallax = [];
  var ticking = false;

  function isInViewport(rect, buffer) {
    buffer = buffer || 0;
    return rect.bottom >= -buffer && rect.top <= (window.innerHeight + buffer);
  }

  function getSpeed(h) {
    var s = parseFloat(h.getAttribute('data-parallax-speed'));
    return Number.isFinite(s) ? s : DEFAULT_SPEED;
  }

  function hasRegionBackground(h) {
    var cs = getComputedStyle(h);
    return !!cs.backgroundImage && cs.backgroundImage !== 'none';
  }

  function clearTransforms(h) {
    var media = h.querySelector('.hero-media');
    if (media) media.style.transform = '';
    h.style.backgroundPosition = '';
  }

  function parallaxUpdate() {
    ticking = false;

    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var width = window.innerWidth || document.documentElement.clientWidth;

    if (width < PARALLAX_BREAKPOINT) {
      parallaxHeroes.forEach(clearTransforms);
      return;
    }

    activeParallax.forEach(function (h) {
      var rect = h.getBoundingClientRect();
      if (!isInViewport(rect, 200)) return;

      var media = h.querySelector('.hero-media');
      var img = media ? media.querySelector('img') : null;
      var bgOnRegion = !img && hasRegionBackground(h);
      var speed = getSpeed(h);

      // Center-anchored: hero center vs viewport center
      var heroCenterPage = scrollY + rect.top + (rect.height / 2);
      var viewportCenter = scrollY + (window.innerHeight / 2);
      var distance = heroCenterPage - viewportCenter;
      var translate = -distance * speed;

      if (img && media) {
        // Responsive image case: translate media both directions (bleed prevents gaps)
        media.style.transform = 'translate3d(0,' + translate + 'px,0)';
        h.style.backgroundPosition = '';
      } else if (bgOnRegion) {
        // Background-on-region case: animate background-position, but don't push image down
        var bgTranslate = Math.min(0, translate); // clamp to avoid revealing top
        h.style.backgroundPosition = '50% calc(50% + ' + bgTranslate + 'px)';
        if (media) media.style.transform = '';
      } else {
        clearTransforms(h);
      }
    });
  }

  function requestParallaxTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(parallaxUpdate);
    }
  }

  function refreshActiveParallax() {
    var width = window.innerWidth || document.documentElement.clientWidth;

    if (width < PARALLAX_BREAKPOINT) {
      activeParallax = [];
      parallaxHeroes.forEach(clearTransforms);
      return;
    }

    activeParallax = parallaxHeroes.filter(function (h) {
      var rect = h.getBoundingClientRect();
      return isInViewport(rect, 300);
    });
  }

  // Small-screen scale helper (unchanged)
  var scaleHeroes = heroes.filter(function (h) {
    return h.getAttribute('data-hero-fit') === 'scale';
  });

  function computeHeightFromNatural(img, containerWidth) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return null;
    return Math.ceil(containerWidth * (img.naturalHeight / img.naturalWidth));
  }

  function setHeroHeight(h, height) {
    if (height && height > 0) {
      h.style.height = height + 'px';
      h.classList.add('hero-scale-active');
    } else {
      h.style.height = '';
      h.classList.remove('hero-scale-active');
    }
  }

  function attachLoadFallback(img, h, containerWidth) {
    var resolved = false;
    function onLoad() {
      if (resolved) return;
      resolved = true;
      try {
        var hpx = computeHeightFromNatural(img, containerWidth) || Math.ceil(img.getBoundingClientRect().height);
        setHeroHeight(h, hpx);
      } catch (e) {
        setHeroHeight(h, null);
      } finally {
        img.removeEventListener('load', onLoad);
      }
    }
    img.addEventListener('load', onLoad);
    setTimeout(function () {
      if (resolved) return;
      if (img.naturalWidth && img.naturalHeight) {
        resolved = true;
        setHeroHeight(h, computeHeightFromNatural(img, containerWidth));
        img.removeEventListener('load', onLoad);
      } else {
        var rect = img.getBoundingClientRect();
        setHeroHeight(h, rect && rect.height ? Math.ceil(rect.height) : null);
        img.removeEventListener('load', onLoad);
      }
    }, 160);
  }

  function adjustHeroToImage(h) {
    var width = window.innerWidth || document.documentElement.clientWidth;
    var media = h.querySelector('.hero-media');
    if (!media) {
      setHeroHeight(h, null);
      return;
    }
    if (getComputedStyle(h).position === 'static') {
      h.style.position = 'relative';
    }
    var img = media.querySelector('img');
    if (width >= SCALE_BREAKPOINT) {
      setHeroHeight(h, null);
      return;
    }
    if (!img) {
      setHeroHeight(h, null);
      return;
    }
    var containerWidth = Math.floor(media.clientWidth || h.clientWidth || window.innerWidth);

    if (typeof img.decode === 'function') {
      img.decode().then(function () {
        var hpx = computeHeightFromNatural(img, containerWidth);
        if (hpx) setHeroHeight(h, hpx);
        else {
          var rect = img.getBoundingClientRect();
          setHeroHeight(h, rect && rect.height ? Math.ceil(rect.height) : null);
        }
      }).catch(function () {
        var hpx = computeHeightFromNatural(img, containerWidth);
        if (hpx) {
          setHeroHeight(h, hpx);
          return;
        }
        attachLoadFallback(img, h, containerWidth);
      });
      return;
    }

    if (img.naturalWidth && img.naturalHeight) {
      var hpx2 = computeHeightFromNatural(img, containerWidth);
      setHeroHeight(h, hpx2);
      return;
    }

    attachLoadFallback(img, h, containerWidth);
  }

  function refreshAllScales() {
    scaleHeroes.forEach(function (h) {
      adjustHeroToImage(h);
    });
  }

  var resizeTimeout = null;
  function debouncedResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      refreshActiveParallax();
      requestParallaxTick();
      refreshAllScales();
    }, DEBOUNCE_MS);
  }

  function init() {
    if (parallaxHeroes.length) {
      window.addEventListener('scroll', requestParallaxTick, { passive: true });
      window.addEventListener('resize', function () {
        refreshActiveParallax();
        requestParallaxTick();
      }, { passive: true });
      refreshActiveParallax();
      requestParallaxTick();
    }

    if (scaleHeroes.length) {
      refreshAllScales();
      window.addEventListener('resize', debouncedResize, { passive: true });
      window.addEventListener('orientationchange', debouncedResize, { passive: true });
    }

    if (window.MutationObserver && scaleHeroes.length) {
      var mo = new MutationObserver(function (mutations) {
        var changed = mutations.some(function (m) {
          return m.addedNodes.length || m.removedNodes.length || (m.type === 'attributes' && (m.attributeName === 'src' || m.attributeName === 'srcset'));
        });
        if (changed) refreshAllScales();
      });
      scaleHeroes.forEach(function (h) {
        mo.observe(h, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset'] });
      });
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
