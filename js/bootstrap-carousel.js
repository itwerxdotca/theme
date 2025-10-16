/**
 * Responsive Bootstrap Multi-Column Carousel (Optimized, Robust, Touch Always Enabled)
 */
(function () {
  const breakpoints = [
    { min: 992, columns: 4 },
    { min: 768, columns: 3 },
    { min: 0,   columns: 1 }
  ];

  function getColumnsPerSlide() {
    const width = window.innerWidth;
    for (const bp of breakpoints) {
      if (width >= bp.min) return bp.columns;
    }
    return 1;
  }

  function getColClass(numCols) {
    const size = Math.floor(12 / numCols);
    return 'col-' + Math.max(1, Math.min(size, 12));
  }

  function empty(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function chunkArray(arr, chunkSize) {
    const out = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      out.push(arr.slice(i, i + chunkSize));
    }
    return out;
  }

  function cleanColClasses(element) {
    const clone = element.cloneNode(true);
    clone.className = clone.className.replace(/col-\w+(\d+)?/g, '').replace(/\s+/g, ' ').trim();
    return clone;
  }

  function getAllCols(carouselInner) {
    const cols = [];
    const rows = carouselInner.querySelectorAll('.carousel-item .row');
    for (const row of rows) {
      for (const col of row.children) {
        if (/col-/.test(col.className)) {
          cols.push(cleanColClasses(col));
        }
      }
    }
    return cols;
  }

  function rebuildIndicators(carouselElem, numSlides) {
    const indicators = carouselElem.querySelector('.carousel-indicators');
    if (!indicators) return;
    empty(indicators);
    for (let i = 0; i < numSlides; i++) {
      const li = document.createElement('button');
      li.type = "button";
      li.setAttribute('data-bs-target', '#' + carouselElem.id);
      li.setAttribute('data-bs-slide-to', i);
      if (i === 0) li.className = 'active';
      li.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      li.setAttribute('aria-label', 'Slide ' + (i + 1));
      indicators.appendChild(li);
    }
  }

  function robustReinitBootstrapCarousel(carouselElem) {
    if (typeof bootstrap !== "undefined" && bootstrap.Carousel) {
      let instance = bootstrap.Carousel.getInstance(carouselElem);
      if (instance) {
        instance.pause();
        instance.dispose();
      }
      // Remove .active from all, set first as active
      const items = carouselElem.querySelectorAll('.carousel-item');
      items.forEach((item, idx) => {
        item.classList.remove('active');
        if (idx === 0) item.classList.add('active');
      });
      // Always re-init (guaranteed at least 3 slides)
      new bootstrap.Carousel(carouselElem, {
        interval: false,
        ride: false,
        pause: true,
        wrap: true,
        touch: true,
        keyboard: true
      });
    }
  }

  function rebuildAllCarousels() {
    const carouselInners = document.querySelectorAll('.carousel-inner');
    for (const carouselInner of carouselInners) {
      const carouselElem = carouselInner.closest('.carousel');
      // Always pause/dispose before DOM changes
      if (carouselElem && typeof bootstrap !== "undefined" && bootstrap.Carousel) {
        let instance = bootstrap.Carousel.getInstance(carouselElem);
        if (instance) {
          instance.pause();
          instance.dispose();
        }
      }

      const allCols = getAllCols(carouselInner);
      if (allCols.length === 0) continue;

      empty(carouselInner);

      const columnsPerSlide = getColumnsPerSlide();
      const colClass = getColClass(columnsPerSlide);
      let slides = chunkArray(allCols, columnsPerSlide);

      // Fill last slide with clones if needed
      if (slides.length > 1 && slides[slides.length - 1].length < columnsPerSlide) {
        const missing = columnsPerSlide - slides[slides.length - 1].length;
        for (let i = 0; i < missing; i++) {
          slides[slides.length - 1].push(allCols[i % allCols.length].cloneNode(true));
        }
      }

      // Robust touch/swipe/wrap fix for single/two slides
      if (slides.length === 1) {
        for (let i = 0; i < 2; ++i) {
          slides.push(slides[0].map(col => col.cloneNode(true)));
        }
      } else if (slides.length === 2) {
        slides.push(slides[0].map(col => col.cloneNode(true)));
      }

      // Build carousel items
      for (let i = 0; i < slides.length; i++) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carousel-item' + (i === 0 ? ' active' : '');
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row g-0';
        for (const col of slides[i]) {
          col.classList.add(colClass);
          rowDiv.appendChild(col);
        }
        itemDiv.appendChild(rowDiv);
        carouselInner.appendChild(itemDiv);
      }

      if (carouselElem) {
        rebuildIndicators(carouselElem, slides.length);
        ['.carousel-control-prev', '.carousel-control-next', '.carousel-indicators'].forEach(selector => {
          carouselElem.querySelectorAll(selector).forEach(el => {
            el.style.display = '';
          });
        });
        robustReinitBootstrapCarousel(carouselElem);
      }
    }
  }

  let debounceTimeout;
  function debounce(fn, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fn, delay);
  }

  function onResize() {
    debounce(rebuildAllCarousels, 100);
  }

  document.addEventListener('DOMContentLoaded', function () {
    rebuildAllCarousels();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize);
  });

  window.updateCarousel = rebuildAllCarousels;
})();
