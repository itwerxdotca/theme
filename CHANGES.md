# Changes in this cleanup (2026-10-12)

Based on `itwerxdotca/theme` at commit `8cde179`.
42 files changed: 648 lines added, 4,665 removed.
`townscanada.theme` went from 892 to 398 lines.

## Before you deploy

1. **Test on a staging copy first.** Then run `drush cr`.
2. **Check whether Bootstrap loads twice.** View the source of any page and
   search for `bootstrap.bundle` and `bootstrap.min.css`. If the base theme
   also loads Bootstrap, you will see two copies. If so, remove the CDN
   entries from `townscanada.libraries.yml`. Two copies of the bundle can make
   modals and offcanvas panels open and immediately close.
3. **Check pages that use `bootstrap5/*` libraries.** These are
   `templates/field/file-link`, `file-audio`, `file-video` and
   `templates/content/comment.html.twig`. They attach `bootstrap5/file` and
   `bootstrap5/indented`, which come from the *bootstrap5* project, not from
   your base theme (`bootstrap` 5.x). They were left unchanged. If the
   bootstrap5 project is not installed, delete those `attach_library()` lines
   or point them at the base theme's equivalents.

## Fixed

### Broken markup and accessibility
- `html.html.twig`: every page printed a stray `">` at the top of `<body>`,
  and the body got the literal class `body_classes` instead of the real
  classes. Both fixed. Empty or space-only classes from unset `b5_*`
  settings are no longer added.
- Skip link restored ("Skip to main content", WCAG 2.4.1). It shows above the
  fixed header when focused. `<main>` is now the target.
- Header: icons hidden from screen readers. Tooltips translated. The Shop
  link gets `rel="noopener"` and says it opens in a new tab. Modal titles are
  `<h2>` (styled as before).
- Search modal tabs: IDs prefixed (`search-pane-…`) so they can't collide
  with other IDs on the page. `aria-controls`, `aria-selected` and
  `aria-labelledby` added.
- Login modal tabs: ARIA added. Pane IDs (`login`, `register`, `password`)
  are unchanged because the `modal/tclogin` endpoint relies on them. The
  spinner is announced ("Loading…"). The error message is translatable and
  announced.
- Taxonomy menu: top-level links contained only an icon. They now have a
  visually hidden name. Decorative SVGs and icons are hidden from screen
  readers.
- Keyboard focus is visible on header buttons. The old ring was `#6661`, which
  is almost transparent.
- Contrast (WCAG AA):
  - Grey `#999` text (2.85:1) changed to Bootstrap's secondary text colour
    (4.7:1).
  - `--prime-ten` changed from `#4FB9A4` (2.4:1 with white) to `#2B7A6B`
    (5.1:1).
  - Province buttons whose colour failed with white text now use dark text.
    PE and NS keep white text.
- Ghost autocomplete no longer takes over the Tab key, so keyboard users are
  no longer trapped (WCAG 2.1.2). Accept a suggestion with → or End, dismiss
  it with Esc. Requests are debounced and stale replies are ignored. It is now
  a Drupal behavior, so it works on forms loaded by AJAX. Ghost text colour
  is now 4.5:1.
- Other untranslated strings: "Submitted on", "Follow".

### Security
- `node--article.html.twig`: removed `{{ gva_iframe|raw }}`. This was a
  leftover from the Gavias theme that nothing provides, and an XSS risk. Also
  `text-left` changed to `text-start`.
- Hero region: background colour and overlay opacity were written into
  `style=""` from editor fields without checks. They are now validated in PHP
  (hex colour only; opacity is a number clamped to 0–1) and passed as CSS
  custom properties.
- `category-badge.html.twig` and the `hero-text-overlay` component: colours
  and `max_width` are checked before going into `style=""`.

### Debug code removed
- `templates/field/image.html.twig`. This was a "temporary debug" override
  of every image on the site. It printed an HTML comment after each image and
  duplicated the `alt`, `src` and size attributes.
- `<!-- DEBUG -->` comments in `hierarchical-taxonomy-menu.html.twig`.

### `townscanada.theme`
- Removed ~220 lines in `preprocess_page` that built `hero_*` and `term`
  variables no template uses.
- `preprocess_block` for hero blocks: now only attaches the parallax library.
  The variables it used to build were unused.
- Hero image logic now lives in one place (`preprocess_region`).
- Taxonomy term pages: a Media reference in a term image field used to cause
  a fatal error (`getFileUri()` called on a Media entity). Term images now go
  through the same helper as node images, which handles both cases.
- Taxonomy menu:
  - All terms load in one query (`loadMultiple`) instead of one query per
    item.
  - A menu item with no term no longer inherits the previous item's term, so
    its children no longer get the wrong parent path in their URL.
  - Unused debug variables removed.
  - The prefix is computed once in PHP. The template no longer recomputes and
    overwrites it.
- Removed `townscanada_system_breadcrumb_alter()`. Drupal only calls that
  hook in *modules*, so it never ran in the theme. Removing it changes
  nothing on the site. If you want those `/province/town/...` breadcrumbs, the
  code needs to go in a small custom module or a `BreadcrumbBuilder` service.
- Removed `townscanada_preprocess_flag()`. It added a per-user cache context
  to every flag link for two variables no template used.
- Hero images no longer get a `title` attribute set to the file name. A
  caption or alt text is set when the editor provides one.
- Removed 8 unused `use` statements. The image style names are constants at
  the top of the file.

### Libraries and info
- `bootstrap-js` no longer forces jQuery onto every page. Bootstrap 5 and
  Bootstrap theme 5.x don't need it. Libraries that do need jQuery declare
  it themselves.
- `modal-forms` now declares its dependency on `townscanada/bootstrap-js`.
  `ghost-autocomplete` now declares `core/drupal`, `core/once` and
  `core/drupal.debounce`.
- The Inter font loads from the library instead of an `@import` inside
  `style.css`, which blocked rendering and could not be aggregated.
- Removed the CKEditor 4 `ckeditor_stylesheets` key.
  `core_version_requirement` is now `^10.3 || ^11`, which SDC in core
  requires.
- **Header.** The floating header markup now lives directly in
  `page.html.twig` instead of being pulled in from
  `templates/region/header.html.twig` (deleted). That file sat in the region
  folder but was never Drupal's `header` region, so blocks placed in
  "Header" were silently dropped. The `header` region is kept and now
  renders inside the floating header, under the navigation bar.
  `js/header-height.js` measures the header, so the page offset adjusts
  automatically. The search and login modals moved to the end of
  `page.html.twig`, next to the offcanvas panels.
- Removed the unused `nav_branding`, `nav_main` and `nav_additional`
  regions (leftovers from the Bootstrap starter subtheme; never printed) and
  their four starter blocks in `config/optional`. **Before deploying**, check
  Block layout: any block placed in one of those three regions will be
  disabled when the theme updates. Those blocks were never visible anyway.
- `config/optional`: the footer menu and powered-by blocks targeted a
  `footer` region that doesn't exist. They now use `footer_bottom`. This only
  affects new installs.
- Font Awesome is **still loaded**. I said earlier it could go. It can't yet,
  because `style.css` and `listing.css` draw about 20 field icons with Font
  Awesome glyphs in `::before`. The 4 Font Awesome icons in templates now use
  their Line Awesome equivalents.

### Components and templates
- `hero-text-overlay`:
  - Removed an invalid `library:` block that pointed at a file that doesn't
    exist (`hero_text_overlay.css`). SDC loads `hero-text-overlay.css`
    automatically.
  - Declared the `title` and `subtitle` slots.
  - Default position in the YAML now matches the template (`bottom-left`).
  - The `attributes` prop is now printed.
- `page.html.twig`: footer columns share the row evenly (`col-md`) instead of
  a fixed quarter width each. The container no longer outputs
  `container container`.
- Hard-coded `style="z-index: 2"` in the carousel replaced with Bootstrap's
  `z-2`.

### Deleted (unused or never loaded)
- `townscanada.theme.old`
- `css/style-2.css` and `js/be_*.min.js`: these are the pixelcave OneUI
  template, a commercial product. Nothing referenced them.
- `templates/block/block--menu--footer.html.twig.twig` and
  `templates/navigation/menu--footer.html.twig.twig`: the double extension
  meant Drupal never loaded them.
- `templates/region/footer.html.twig`: not a valid template name.
- `responsive-image-responsive-image--hero_responsive.html.twig`: no hook
  suggestion matches this name.
- `components/title/`: unused starter-kit leftover.
- The `hero-text-overlay` placeholder README.
- Stale `.css.map` files, `.DS_Store`, `.nova/`.

## Checks run
- `php -l townscanada.theme`: no syntax errors (PHP 8.3).
- All Twig templates parse with Twig 3.14. The only failure is
  `views-mini-pager`, and only because the linter doesn't know Drupal's
  `{% trans %}` tag. The original theme gives the same result.
- All YAML files parse. All JS passes `node --check`.
- Taxonomy menu URL logic was unit-tested with stub terms. URLs come out the
  same as before, apart from the parent-path bug fix above.
- Colour contrast was checked for every colour changed.
- **Not tested on a running Drupal site.** Test on staging first.

## Still to do (not in this cleanup)
1. **Taxonomy menu URLs (optional).** Use the terms' Pathauto aliases instead
   of building slugs by hand. Hand-built slugs give results like `caf-s` for
   "Cafés" and a trailing `-` for names ending in punctuation. Only matters
   if category names have accents or end in punctuation.
2. **Points of Interest search tab.** Empty until the POI search form is
   built.
3. **Views overrides (optional).** Diff the views templates against the base
   theme and delete any that are unmodified copies.

Considered and left as is: moving the CSS into SCSS partials, and dropping
one of the two icon fonts. Both work fine; the gains don't justify the work.
