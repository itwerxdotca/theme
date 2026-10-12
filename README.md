# townscanada theme

Subtheme of [Bootstrap](https://www.drupal.org/project/bootstrap) 5.x
(machine name `bootstrap`).

## Development

### CSS

`css/style.css` and `css/components/*.css` are edited **by hand** and are the
CSS that ships.

> **Warning:** `scss/style.scss` is *not* the source of `css/style.css`. It
> only compiles Bootstrap plus a few variables. Running
> `sass scss/style.scss css/style.css` will **overwrite all custom CSS**.
> Do not run it until the hand-written CSS has been moved into `scss/`
> partials (see CHANGES.md, "Still to do").

### Components

Single Directory Components live in `components/` and are used as
`townscanada:card`, `townscanada:slider` and `townscanada:hero-text-overlay`.
SDC is part of Drupal core (10.3+); no module is needed.

### Modules the theme relies on

- Twig Tweak (`drupal_block()`, `drupal_menu()` in the page and header
  templates).
- Hierarchical Taxonomy Menu, Flag and Media. Responsive Image is used for
  hero images when it is installed.
