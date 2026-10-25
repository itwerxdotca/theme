# Changes

Newest first. Overall, from 2026-10-12 (`4332ae6`) to 2026-10-25
(`f9511b8`): 84 files changed, 1,477 lines added, 6,468 removed.
`townscanada.theme` went from 892 to 382 lines; the theme has 38 templates,
down from 62.

## Site setup this theme now relies on

These live in the site's configuration or in `helper_module`, not in this
repository. A fresh site needs them for the theme to work as described.

- **`helper_module`**: the Town search block (`helper_module_town_search`),
  printed on the front page by `page--front.html.twig`.
- **View `tc_town_banner`** and its block `townscanada_tc_town_banner` in the
  Header region: the town banner on town and province pages. Created with
  `drush ev` and `View::create()` on 2026-10-25.
- **PWA module** (`pwa` 2.1.0-beta7) with the `access pwa` permission
  granted to anonymous and authenticated users (otherwise `/manifest.json`
  returns 403), and its **`pwa_a2hs`** submodule enabled for the Install
  button.
- **Service worker cache exclusions** (PWA settings): `admin/.*`,
  `user/reset/.*`, `/node/.*`, `user$`, `user/.*`, `flag/.*`, with
  `cache_version` 2. Offline page: `/offline`.

## 2026-10-25: "Get the app" modal (Stage 1)

- `page.html.twig`: a "Get the app" modal next to the search and login
  modals. The app icon (`public://pwa/app-logo-transparent_192x192.png`) on a
  white rounded tile with a shadow, then "Discover it on Towns Canada! / Get
  the app!!". On iPhone and iPad, the two Share steps. The modal title is
  visually hidden but still read by screen readers.
- `js/get-app.js` (new): never runs in the installed app. Opens the modal by
  itself once per phone or tablet: on Android when the browser offers to
  install, on iPhone straight away. Never by itself on a computer. Opens
  every time a link or button marked `data-app-only` is tapped. On Android
  the icon is the Install button: it presses the `pwa_a2hs` block's own
  button, which is hidden.
- `templates/block/pwa-add-to-home-screen.html.twig` (new) and
  `css/components/pwa-install.css` (new): the `pwa_a2hs` block's markup,
  keeping the classes its script needs, and hiding its own button.
- `townscanada.libraries.yml`: `pwa-install` and `get-app` libraries.
- `css/style.css`: the search modal's rules (rounded corners, shadow, title
  size) also apply to `#getAppModal`. The "Toolbar z-index fix" rule for
  `.toolbar-menu-administration` was removed; the admin toolbar works
  without it.

## 2026-10-25: Template cleanup, batch 2

Templates compared with the base theme (`bootstrap` 5.0.2) file by file.

- Removed copies identical to the base theme's, or different only in
  comments or whitespace: `field/time`, `field/field--comment`,
  `field/field`, `field/image-formatter`, `views/views-view-summary`,
  `views/views-view-unformatted`, `views/views-view-list`.
- Removed overrides that caused problems:
  - `layout/html.html.twig`: printed the literal class `body_classes` and a
    stray `"` inside `<body>`, used `b5_*` variables from the separate
    bootstrap5 theme, and had the skip link commented out. The base
    theme's version is used now.
  - `content/comment.html.twig`, `field/file-link`, `file-audio`,
    `file-video`: attached `bootstrap5/indented` and `bootstrap5/file`,
    libraries that don't exist on this site.
  - `views/views-view-table.html.twig`: dropped the base theme's
    `table-responsive` wrapper, so wide tables overflowed on phones.
  - `user/username.html.twig`: printed `account_name`, which nothing on the
    site provides, so linked usernames were empty. The base theme prints
    `name`, which Realname still sets.
  - `layout/maintenance-page.html.twig`: the base theme's version is used.
- Kept on purpose: `page.html.twig`, `block--system-branding-block`,
  `links--inline` (hides comment links from anonymous visitors),
  `region.html.twig` (`<div>` rather than `<section>`), `views-view.html.twig`
  (no Bootstrap `row` on every View), `views-view-grid`,
  `views-exposed-form`, `views-mini-pager`, and the node title, author and
  created field templates (Drupal core's current versions).
- Checked: Bootstrap loads once, from the CDN in `global-styling`. The base
  theme's local copy isn't attached.

## 2026-10-24/25: Template cleanup, batch 1, and the town banner as a block

- Removed unused files: `js/be_comp_rating.min.js`,
  `js/be_ui_animations.min.js`, `js/be_ui_icons.min.js`,
  `js/ghost-autocomplete.js` and `css/components/ghost-autocomplete.css`
  (the library was never attached), `templates/region/header.html.twig`
  (not a valid template name), the two `.html.twig.twig` footer templates,
  `templates/components/category-badge.html.twig`, the debug
  `templates/field/image.html.twig`, and identical copies of `user.html.twig`,
  `field--text`, `field--text-long`, `field--text-with-summary`,
  `link-formatter-link-separate`, `image-style`, `views-view-grouping` and
  `views-view-summary-unformatted`.
- Removed unused components: `action`, `bucket-progress`, `province-chip`,
  `search-trigger`, `trip-card` (built ahead of their stages) and `title`.
- `townscanada.theme`: removed the loop for `nav_branding`, `nav_main` and
  `nav_additional` (regions that don't exist), unused debug variables in
  the taxonomy menu preprocess, and the "Breadcrumb hook triggered" log
  entry written on every page. The `use` statements were kept.
- `townscanada.libraries.yml`: removed the `ghost-autocomplete` library and
  its CSS line.
- `.nova/` is no longer tracked, and is listed in `.gitignore`.
- **Town banner as a block.** `taxonomy-term--canadian-towns.html.twig` no
  longer prints the banner. The View `tc_town_banner` does, through
  `templates/views/views-view-fields--tc-town-banner.html.twig` (new), which
  Views picks by the View's name. The full-width colour now comes from the
  class `tc-town-banner--full` in `town-banner.css`.
- **Header region moved.** `page.html.twig` prints the Header region at the
  top of `<main>`, above the breadcrumb, instead of inside the floating
  header. `townscanada.info.yml` labels it "Header (above the breadcrumb)".
  The floating navigation bar is unchanged.

## 2026-10-20: Hero removed, province colours, town banner, front page search

- **Hero removed** entirely: the `hero` region, `region--hero.html.twig`,
  `field--field-hero-image.html.twig`, the `hero_responsive` responsive
  image template, `js/parallax.js` and its library, the `hero-text-overlay`
  component, the `.hero-term` wrapper in `views-bootstrap-carousel`,
  `views-view-fields--listings--block-1.html.twig`, all hero CSS, and the
  hero functions in `townscanada.theme` (`townscanada_file_url`,
  `_townscanada_extract_image_from_field`, `townscanada_preprocess_block`,
  `townscanada_preprocess_region`). `field_hero_image` is no longer
  excluded in the listing and point-of-interest templates. Blocks that were
  in the hero region were left disabled in Header.
- **Province pills**: a white pill with the province's colour dot and its
  name.
- **Province colour on province pages**: `_townscanada_term_province_code()`
  finds the code from the term, its parents, or the province name, so
  province pages get their colour too. The small province name above the
  title is left off on a province's own page.
- **Town banner**: the same height for every town and province (long
  names shrink to fit on one line), and the colour runs the full width of
  the screen at every size.
- **Front page**: the search box that opened the search modal was replaced
  with the Town search block from `helper_module`.
- Removed `css/style-2.css` and `townscanada.theme.old`.

## 2026-10-17: Stage 2 app layout

- Components added: `icon`, `place-row`, `section`, `town-banner`,
  `town-tile`, and others since removed (see batch 1).
- `page--front.html.twig`: the Discover screen ("Where to next?") above the
  front page's content.
- `menu--mobile-tabs.html.twig` and `css/components/app-tabbar.css`: the
  bottom tab bar on phones, from the "Mobile tabs" menu.
- `taxonomy-term--canadian-towns.html.twig`: town pages in their province
  colour.
- Views templates for place rows and town tiles, chosen by the CSS class
  `tc-place-list` or `tc-town-tiles` on a View display.
- `townscanada.theme`: `has-province province-<code>` body classes, province
  helpers, and the Views template suggestions.

---

**Note on the entry below.** The 2026-10-12 entry describes a cleanup that
was only partly applied to this repository. Several items it lists as done
were still in the theme until the batches above, for example the debug
`image.html.twig`, the broken `<body>` tag in `html.html.twig`,
`townscanada_system_breadcrumb_alter()` (still in the theme),
`style-2.css` and the
`be_*.min.js` files. Read it as history, not as a description of the
current theme.

## 2026-10-12: Cleanup (partly applied, see the note above)

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
- `php -l townscanada.theme`: no syntax errors (PHP 8.4).
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
