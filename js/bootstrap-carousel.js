/**
 * @file
 * Multi-column Bootstrap carousel for views-bootstrap-carousel.html.twig.
 *
 * Regroups the view's items into slides of 1, 3 or 4 columns depending on
 * the screen width. It rebuilds only when a breakpoint is actually crossed,
 * so the address bar sliding in and out on a phone (which fires "resize")
 * no longer throws the visitor back to the first slide, and it keeps the
 * visitor's place when the column count does change.
 */
((Drupal, once) => {
  const BREAKPOINTS = [
    { min: 992, columns: 4 },
    { min: 768, columns: 3 },
    { min: 0, columns: 1 },
  ];
  const queries = BREAKPOINTS.filter((bp) => bp.min > 0).map((bp) =>
    window.matchMedia(`(min-width: ${bp.min}px)`),
  );
  const columnsNow = () =>
    BREAKPOINTS.find((bp) => window.innerWidth >= bp.min).columns;

  function build(carousel, items, columns, firstItem) {
    const { Carousel } = window.bootstrap || {};
    if (!Carousel) {
      return;
    }
    const existing = Carousel.getInstance(carousel);
    if (existing) {
      existing.dispose();
    }

    const inner = carousel.querySelector('.carousel-inner');
    const total = Math.ceil(items.length / columns);
    const active = Math.min(Math.floor(firstItem / columns), total - 1);
    const colClass = `col-${12 / columns}`;

    const slides = [];
    for (let s = 0; s < total; s++) {
      const slide = document.createElement('div');
      slide.className = s === active ? 'carousel-item active' : 'carousel-item';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', Drupal.t('slide'));
      slide.setAttribute(
        'aria-label',
        Drupal.t('@index of @total', { '@index': s + 1, '@total': total }),
      );
      const row = document.createElement('div');
      row.className = 'row g-0';
      items.slice(s * columns, (s + 1) * columns).forEach((item) => {
        item.className = item.className.replace(/\bcol-\S+/g, '').trim();
        item.classList.add(colClass);
        row.append(item);
      });
      slide.append(row);
      slides.push(slide);
    }
    inner.replaceChildren(...slides);

    const indicators = carousel.querySelector('.carousel-indicators');
    if (indicators) {
      const dots = slides.map((slide, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.dataset.bsTarget = `#${carousel.id}`;
        dot.dataset.bsSlideTo = String(i);
        dot.setAttribute(
          'aria-label',
          Drupal.t('Go to slide @index', { '@index': i + 1 }),
        );
        if (i === active) {
          dot.className = 'active';
          dot.setAttribute('aria-current', 'true');
        }
        return dot;
      });
      indicators.replaceChildren(...dots);
    }

    // Nothing to page through when everything fits on one slide.
    carousel
      .querySelectorAll(
        '.carousel-control-prev, .carousel-control-next, .carousel-indicators',
      )
      .forEach((el) => {
        el.style.display = total < 2 ? 'none' : '';
      });

    // Initialising straight away is what makes swipe work before the
    // first button press.
    Carousel.getOrCreateInstance(carousel, {
      interval: false,
      ride: false,
      touch: true,
      wrap: true,
      keyboard: true,
    });
  }

  /**
   * Builds and maintains the multi-column carousels.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.townscanadaCarousel = {
    attach(context) {
      once('tc-carousel', '[data-tc-carousel]', context).forEach((carousel) => {
        const items = [
          ...carousel.querySelectorAll('.carousel-item .row > *'),
        ];
        if (!items.length) {
          return;
        }
        let columns = columnsNow();
        build(carousel, items, columns, 0);

        const onBreakpoint = () => {
          const next = columnsNow();
          if (next === columns) {
            return;
          }
          const slides = [...carousel.querySelectorAll('.carousel-item')];
          const active = Math.max(
            0,
            slides.findIndex((slide) => slide.classList.contains('active')),
          );
          const firstItem = active * columns;
          columns = next;
          build(carousel, items, columns, firstItem);
        };
        queries.forEach((query) =>
          query.addEventListener('change', onBreakpoint),
        );
      });
    },
  };
})(Drupal, once);
