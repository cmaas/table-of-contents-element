# table-of-contents-element

```html
<table-of-contents></table-of-contents>
```

A lightweight **Table of contents** generator, distributed as a web component.

**Features:**

* Takes all headlines of a webpage or article and turns them into semantically correct nested lists
* Selection of headlines can be specified by providing the `selector` attribute, which uses `querySelectorAll`
* Handles complex cases: headlines not ordered as expected, but h3 followed by h2 etc.
* Does NOT use shadow DOM for easy styling and to inherit the style of your page/article; does **not** come with its own style
* Adds links to list items, if a headline has an `id` attribute
* Can be provided with custom HTML to add a header, footer or wrap the entire list in a `<details>` tag (see Examples)
* Zero-dependencies

[Demo](https://cmaas.github.io/table-of-contents-element/test/)

## Usage

Via npm:

```sh
npm install table-of-contents-element
```

```js
import 'table-of-contents-element';
```

Or as a `<script>` tag:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/table-of-contents-element/index.js"></script>
```

Then use the HTML:

```html
<table-of-contents></table-of-contents>
```

Including the script automatically defines the custom element.

### Examples

#### Basic usage, finds all `h1`, `h2`, `h3`, `h4` of a page:

```html
<table-of-contents></table-of-contents>
```

#### Custom headline selector:

```html
<table-of-contents selector="article h2, article h3:not(.newsletter-signup)"></table-of-contents>
```

Or target only headlines that have an `id` attribute:

```html
<table-of-contents selector="h1[id], h2[id], h3[id], h4[id]"></table-of-contents>
```

#### Change list type to `ol`:

```html
<table-of-contents listtype="ol"></table-of-contents>
```

#### Wrap the list in custom HTML:

You can give any child element an attribute called `data-toc-render-target` to specify where the list items should be rendered. This way, you can wrap the table of contents in a `<details>` tag:

```html
<table-of-contents>
    <details>
        <summary>Table of contents</summary>
        <div data-toc-render-target></div>
    </details>
</table-of-contents>
```

Or add a `<header>` and `<footer>` to your table of contents:

```html
<table-of-contents>
    <header>Table of contents</header>
    <div data-toc-render-target></div>
    <footer>powered by table-of-contents-element</footer>
</table-of-contents>
```

If you do not provide an attribute `data-toc-render-target`, the generated list will be added as the last child:

```html
<table-of-contents>
    <header>Table of contents</header>
    <!-- toc list will be placed here -->
</table-of-contents>
```

## API

If you need to re-create the table of contents, for example, because the article content changed dynamically, you can call `render()`:

```js
const toc = document.getElementsByTagName('table-of-contents')[0];
toc.render(); // recreates the TOC
```

The `table-of-contents` custom element can be created via JS:

```js
const toc = document.createElement('table-of-contents');
toc.setAttribute('selector', 'h2, h3, h4');
document.body.appendChild(toc);
```

Please note that `<table-of-contents>` does not observe changes to attributes. In the rare case that you need to change attributes, simply destroy the existing element and re-create it.

### Methods

| Method | Description |
|:--|:--|
| `render()` | Recreates the table of contents |

### Attributes

| Attribute | Values | Default | Description |
|:--|:--|:--|:--|
| `listtype` | "ul" or "ol" | "ul" | List type for items
| `selector` | whatever [querySelectorAll()](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) accepts | "h1, h2, h3, h4" | Query selector for headlines to generate the TOC from

### Properties

None. *Note: Attributes are not reflected to properties.*
