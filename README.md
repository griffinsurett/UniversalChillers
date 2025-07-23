# Greactstro

# start by installing 
npm install astro@latest react@latest react-dom@latest @astrojs/mdx@latest @astrojs/react@latest tailwindcss@latest @tailwindcss/vite@latest @types/react@latest @types/react-dom@latest dotenv

npx astro dev --host

# Greactstro Project Documentation

## 1. Project Overview and Purpose

# Greactstro Project Documentation

## 1. Project Overview and Purpose

**Greactstro** is an Astro-based, content-driven website framework. It dynamically generates pages, menus, and UI components based solely on content files (MDX, Markdown, JSON). Key goals:

* **Data-driven content:** Non-technical users add MDX, Markdown, or JSON files; the site builds pages, menus, and features automatically.
* **Flexible UI components:** Reusable Section, ItemsTemplate, Carousel, Menu, and Form components allow consistent design patterns.
* **SEO & Accessibility:** Layouts provide SEO meta tags and semantic structure; theme support and ARIA-ready components.
* **Integrations:** Form handling via Formspree; placeholders for analytics and cookie consent.
* **Starter schemas:** Example collections (services, projects, testimonials) demonstrate patterns and can be replaced.

---

## 2. Content Collections and Schemas

The framework requires only four core collections; additional collections are provided as examples and can be removed or replaced.

### 2.1 Core Collections

1. **menus** (`src/content/menus.json`)

   * **id** (`string`): Unique menu container identifier (e.g., `mainMenu`, `footerMenu`).
   * **title** (`string`): Display name of the menu container.
   * **description** (`string?`): Optional description for documentation.

2. **menuItems** (`src/content/menuItems.json` + generated via `MenuItemsLoader`)

   * **id** (`string`): Unique item key (e.g., `home`, `about-us`).
   * **title** (`string`): Text shown in link.
   * **link** (`string`): Path or absolute URL.
   * **menu** (`string | string[]`): IDs of menus this item belongs to.
   * **parent** (`string?`): Parent menu item ID for nesting.
   * **order** (`number` default `0`): Sibling ordering.
   * **openInNewTab** (`boolean` default `false`): Open link in new tab.

3. **contact** (`src/content/contact.json`)

   * **id** (`string`): Contact method key (e.g., `email`, `phone`).
   * **title** (`string`): Display text (e.g., email address).
   * **linkPrefix** (`string`): Prefix for `href` (e.g., `mailto:`, `tel:`).
   * **order** (`number` default `0`): UI ordering.

4. **socialMedia** (`src/content/socialMedia.json`)

   * **id** (`string`): Platform key (e.g., `twitter`, `linkedin`).
   * **icon** (`string`): Icon name or emoji.
   * **link** (`string`): Full URL to profile.
   * **order** (`number` default `0`): UI ordering.

### 2.2 Base Schema (All Collections)

Located in **`src/content/schema.ts`**:

```ts
export const baseSchema = ({ image }) => z.object({
  id: z.string().optional(),        // Overrides auto-generated slug
  title: z.string(),                // Main heading or name
  description: z.string().optional(),
  order: z.number().default(0),     // Manual sort order
  date: z.date().optional(),        // For date-based content
  featuredImage: image().optional(),
  tags: z.array(z.string()).default([])
});
```

Fields:

* `id`: use custom slug if provided.
* `title`: required display name.
* `description`: optional summary.
* `order`: numeric weight for manual sorting.
* `date`: optional date field.
* `featuredImage`: optional processed image.
* `tags`: array for tag-based queries.

### 2.3 Starter Collection Schemas (Optional Examples)

#### services

```ts
services: defineCollection({
  schema: ({ image }) =>
    baseSchema({ image }).extend({
      icon: z.string().optional(),
      parent: z.union([
        reference("services"), z.array(reference("services"))
      ]).optional()
    })
});
```

* `icon` (`string?`): Emoji or icon identifier.
* `parent` (`string|string[]?`): References to parent services.

#### projects

```ts
projects: defineCollection({
  schema: ({ image }) =>
    baseSchema({ image }).extend({
      beforeImage: image().optional(),
      afterImage: image().optional(),
      services: z.union([
        reference("services"), z.array(reference("services"))
      ]).optional(),
      testimonials: z.union([
        reference("testimonials"), z.array(reference("testimonials"))
      ]).optional()
    })
});
```

* `beforeImage`/`afterImage` (`Image?`): Comparison images.
* `services` (`string|string[]?`): Service refs.
* `testimonials` (`string|string[]?`): Testimonial refs.

#### testimonials

```ts
testimonials: defineCollection({
  schema: ({ image }) =>
    baseSchema({ image }).extend({
      project: reference("projects").optional(),
      service: reference("services").optional()
    })
});
```

* `project` (`string?`): Project ref.
* `service` (`string?`): Service ref.

*(Other example collections like `clients`, `FAQ` follow similar patterns.)*

---

### 2.4 \_meta Schemas

Each collection’s `_meta.mdx` frontmatter is validated by a **meta schema** (`metaSchema`) defined in `schema.ts`. This schema controls routing, menus, and default sections.

#### 2.4.1 Collection Meta (`metaSchema`)

* **id** (`string`): Collection identifier (slug).
* **title** (`string?`): Title for index page (fallback: capitalized collection name).
* **description** (`string?`): Subtitle for index page.
* **ogType** (`string?`): Open Graph `og:type` value (default: `website`).
* **keywords** (`string[]?`): SEO meta tag keywords.
* **hasPage** (`boolean` default `true`): Generate `/collection` index page.
* **itemsHasPage** (`boolean` default `true`): Generate `/collection/slug` pages.
* **addToMenu** (`Array<{ menu: string; title?: string; link?: string; order?: number; parent?: string; respectHierarchy?: boolean }>?`): Add the collection index page to one or more menus.
* **itemsAddToMenu** (`Array<{ menu: string; title?: string; link?: string; order?: number; parent?: string; respectHierarchy?: boolean }>?`): Add each item page to menus.
* **heading** (`string | HeadingPart[]?`): Complex heading for index. `HeadingPart` = `{ text: string; class?: string; tag?: string }`.
* **defaultSection** (`{ collection?: string; query?: string; heading?: string | HeadingPart[]; description?: string; component?: string; sortBy?: 'title' | 'date'; sortOrder?: 'asc' | 'desc'; manualOrder?: boolean; slider?: { enabled: boolean; slidesToShow?: number; autoplay?: boolean }; sectionClass?: string; contentClass?: string; itemsClass?: string; itemClass?: string }?`): Default Section props for the index page listing of this collection.
* **itemsSections** (`Array<{ collection: string; query: string; heading?: string | HeadingPart[]; description?: string; component?: string; sortBy?: 'title' | 'date'; sortOrder?: 'asc' | 'desc'; manualOrder?: boolean; slider?: { enabled: boolean; slidesToShow?: number; autoplay?: boolean }; sectionClass?: string; contentClass?: string; itemsClass?: string; itemClass?: string }>?`): Sections to show on each item page.
* **respectHierarchy** (`boolean?`): When `itemsAddToMenu`, nest items under their `parent` references in menus.

#### 2.4.2 Item Section Schema

Each entry in `itemsSections` or in Section defaults shares these fields:

* **collection** (`string`): Target collection to query.
* **query** (`string`): Keyword for `getAll`, `related`, `parent`, etc.
* **heading** (`string | HeadingPart[]?`): Override section title.
* **description** (`string?`): Override subtitle.
* **component** (`string?`): Item template override.
* **sortBy** (`'title' | 'date'?`), **sortOrder** (`'asc' | 'desc'?`), **manualOrder** (`boolean?`): Sorting logic.
* **slider** (`{ enabled: boolean; slidesToShow?: number; autoplay?: boolean }?`): Slider config passed to Carousel in client mode.
* **sectionClass**, **contentClass**, **itemsClass**, **itemClass** (`string?`): Custom CSS.

---

## 3. Relational & Hierarchical Content

Content relationships via Zod `reference()` drive dynamic queries:

* **getAll**: lists all items.
* **related**: items referencing current page or collection.
* **parent/children/sibling**: based on `parent` field.
* **tag queries**: fallback when no keyword.

Implemented in **`src/utils/CollectionQueryUtils.ts`**, enabling Sections to fetch related content with `query="related"`, etc.

Content relationships via Zod `reference()` drive dynamic queries:

* **getAll**: lists all items.
* **related**: items referencing current page or collection.
* **parent/children/sibling**: based on `parent` field.
* **tag queries**: fallback when no keyword.

Implemented in **`src/utils/CollectionQueryUtils.ts`**, enabling Sections to fetch related content with `query="related"`, etc.

---

## 4. Layouts, Default Pages, and SEO

*Structure in `src/layouts/`:*

* **BaseLayout.astro**: HTML skeleton, `<SEO>`, `<Header>`, `<AnimationLayout>`, `<main>`, `<Footer>`.
* **SEO.astro**: Inserts `<title>`, meta tags (description, Open Graph, Twitter), canonical URL (using `PUBLIC_SITE_DOMAIN`).
* **ExtendedLayout.astro**: Extends BaseLayout; adds `<QuoteForm />` call-to-action at page end.

Pages in `src/pages/` import layouts and pull in content (e.g., policies fetch `contact` data), with dynamic route templates for collections in `[collection]/index.astro` and `[collection]/[slug].astro` (respect `hasPage` flags in `_meta`).

---

## 5. Section Component (Comprehensive)

**File:** `src/components/Section/Section.astro`

### 5.1 Props API

| Prop             | Type                                                                   | Default          | Description                                                               |                                                    |                                                    |
| ---------------- | ---------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `collection`     | `string`                                                               | —                | Content collection name                                                   |                                                    |                                                    |
| `query`          | `string`                                                               | —                | Query keyword (`getAll`, `related`, `parent`, `children`, `sibling`, tag) |                                                    |                                                    |
| `heading`        | \`string                                                               | HeadingPart\[]\` | `undefined`                                                               | Override section title; array for styled fragments |                                                    |
| `description`    | `string`                                                               | `undefined`      | Override subtitle                                                         |                                                    |                                                    |
| `variant`        | `string`                                                               | `undefined`      | Style preset from `SectionVariants.js`                                    |                                                    |                                                    |
| `sortBy`         | \`'title'                                                              | 'date'\`         | meta or `'title'`                                                         | Field for sorting                                  |                                                    |
| `sortOrder`      | \`'asc'                                                                | 'desc'\`         | meta or `'asc'`                                                           | Sort direction                                     |                                                    |
| `manualOrder`    | `boolean`                                                              | meta or `false`  | Use frontmatter `order` values                                            |                                                    |                                                    |
| `component`      | \`string                                                               | AstroComponent   | ComponentImport\`                                                         | meta or `'Card'`                                   | Item template to render                            |
| `client`         | \`'load'                                                               | 'visible'        | 'idle'\`                                                                  | `undefined`                                        | Astro hydration strategy for client list rendering |
| `slider`         | `{ enabled: boolean; slidesToShow?: number; autoplay?: boolean; ... }` | meta or `{}`     | If `enabled`, passed to Carousel for sliders                              |                                                    |                                                    |
| `sectionClass`   | `string`                                                               | `''`             | CSS for `<section>` element                                               |                                                    |                                                    |
| `contentClass`   | `string`                                                               | `''`             | CSS for content wrapper                                                   |                                                    |                                                    |
| `itemsClass`     | `string`                                                               | `''`             | CSS for items `<ul>` or client wrapper                                    |                                                    |                                                    |
| `itemClass`      | `string`                                                               | `''`             | CSS for `<li>` wrappers                                                   |                                                    |                                                    |
| `childPlacement` | \`'end'                                                                | 'afterItems'     | ...\`                                                                     | `'end'`                                            | Where to render slot children                      |
| `itemPlacement`  | \`'belowHeading'                                                       | 'headingArea'\`  | `'belowHeading'`                                                          | Position items relative to heading                 |                                                    |

### 5.2 Internal Workflow

1. **Load Meta Defaults:** Read `meta.defaultSection` from `_meta.mdx` (heading, description, component, sort, CSS).
2. **Fetch Items:** `await getSectionItems(query, collection, currentPath)` → powered by Query Utils.
3. **If Empty:** Return early (no rendering).
4. **Resolve Heading/Description:** Prop → Meta → Fallback (capitalized name).
5. **Merge Styles:** Combine `SectionVariants[variant]`, meta defaults, and explicit props.
6. **Sort:** `sortItems(items, sortBy, sortOrder, manualOrder)`.
7. **Render Items:**

   * **Client Hydration:** If `client` set, render `<ClientItemsTemplate client:${client} ...>` with `slider` props.
   * **SSR:** Else render `<ul class={itemsClass}>` and map `<ItemComponent item={...} class={itemClass}/>`.
8. **Render Slot:** Insert `<slot/>` at `childPlacement`.

### 5.3 Usage Examples

* List all: `<Section collection="services" query="getAll" />`
* Related: `<Section collection="testimonials" query="related" />`
* Hierarchy: `<Section collection="services" query="children" heading="Sub-Services" />`
* Slider: `<Section collection="projects" query="getAll" client="idle" slider={{ enabled: true, slidesToShow: 3, autoplay: true }}/>`

---

## 6. Menu Component (Comprehensive)

**File:** `src/components/Menu/Menu.astro`

### 6.1 Props API

| Prop          | Type                                                                                                                            | Default  | Description                        |                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | ------------------------- |
| `collection`  | `'menuItems'`                                                                                                                   | —        | Collection to query links from     |                           |
| `query`       | `string`                                                                                                                        | —        | e.g., `relatedItem:menus:mainMenu` |                           |
| `sortOrder`   | \`'asc'                                                                                                                         | 'desc'\` | `'asc'`                            | Sort direction by `order` |
| `manualOrder` | `boolean`                                                                                                                       | `true`   | Respect `order` from data          |                           |
| `responsive`  | `boolean`                                                                                                                       | `true`   | Enable mobile vs desktop layouts   |                           |
| `breakpoint`  | `string`                                                                                                                        | `'lg'`   | Tailwind breakpoint for switch     |                           |
| `desktop`     | `{ itemsClass: string; menuItem: { component?: Component; props?:object }; submenu?: { component?:Component; props?:object } }` | —        | Desktop config                     |                           |
| `mobile`      | `{ component: Component; props:object; submenuProps?:object }`                                                                  | —        | Mobile config (hamburger menu)     |                           |

### 6.2 Workflow

1. **Query Items:** `await queryItems(query, 'menuItems')`; select root (parent undefined).
2. **Desktop:**

   * `<ul class={desktop.itemsClass}>`
   * For each item:

     * Render `desktop.menuItem.component` (default `MenuItem`) with props.
     * If `item.children`, render `desktop.submenu.component` (default `Submenu`) with `submenu.props`.
3. **Mobile:**

   * Render hamburger toggle; on open, render `mobile.component` (default `MobileMenuItem`) recursively.
4. **Accessibility:**

   * ARIA attributes on menu buttons, focus management in dropdowns.

### 6.3 MenuItem Component

**File:** `src/components/Menu/MenuItem.astro`
**Props:**

* `item`: `{ id, title, link, openInNewTab, icon?, children?[] }`
* `hierarchical`: `boolean` to enable nested dropdowns.
* `submenuComponent?`: override default.

**Render:**

```astro
<li class="relative group">
  <Button as="a"
          href={item.link}
          target={item.openInNewTab ? '_blank' : '_self'}
          class="...">
    {item.icon && <Icon name={item.icon}/>} {item.title}
    {item.children?.length > 0 && <ChevronDownIcon />}
  </Button>
  {item.children?.length > 0 && <Submenu items={item.children} />}
</li>
```

* Handles icons, links, nested submenus, hover visibility via CSS.

### 6.4 Submenu Component

**File:** `src/components/Menu/Submenu.astro`
**Props:**

* `items`: `MenuItem[]`
* `className?`: custom CSS

**Render:**

```astro
<ul class={className}>
  {items.map(child => <MenuItem item={child} hierarchical />)}
</ul>
```

* Recursively nests child menus.

---

## 7. ItemsTemplate & Carousel

*Details in previous sections: sorting, SSR vs client, slider config, custom Carousel component with autoplay and drag.*

---

## 8. Forms & Formspree Integration

This section covers the generic Form component API, how the ContactForm is configured, and the inline script that handles submissions and displays success or error banners—all without a custom backend.

### 8.1 Form Component (`Form.astro`)

**File:** `src/components/Form/Form.astro`

#### Props API

| Prop                   | Type      | Default                            | Description                                                      |
| ---------------------- | --------- | ---------------------------------- | ---------------------------------------------------------------- |
| `action`               | `string`  | —                                  | URL endpoint for form submissions (e.g. Formspree endpoint)      |
| `method`               | `string`  | `'POST'`                           | HTTP method                                                      |
| `showConsent`          | `boolean` | `true`                             | Render GDPR consent checkbox                                     |
| `consentLabel`         | `string`  | —                                  | Custom label text for the consent checkbox                       |
| `consentLink`          | `string`  | `'/privacy-policy'`                | URL for the privacy policy linked in the consent text            |
| `enableSuccessBanner`  | `boolean` | `false`                            | When `true`, triggers the inline script to show a success banner |
| `successBannerMessage` | `string`  | `'Thank you for your submission.'` | Message displayed in the success banner                          |
| `submitButtonText`     | `string`  | `'Submit'`                         | Text for the form’s submit button                                |

#### Internal Structure

1. Renders a `<form action={action} method={method} data-success-banner={enableSuccessBanner} data-success-message={successBannerMessage}>` wrapper.
2. Renders slot content—developers place `<TextInput>` and `<Textarea>` components between `<Form>...</Form>`.
3. If `showConsent` is `true`, adds a required checkbox:

   ```astro
   <label>
     <input type="checkbox" name="consent" required />
     {consentLabel || `I consent to storing my data and agree to the `}
     <a href={consentLink}>privacy policy</a>.
   </label>
   ```
4. Renders the submit button:

   ```astro
   <button type="submit">{submitButtonText}</button>
   ```
5. Includes an inline `<script>` at the bottom that:

   * Listens for the form’s `submit` event.
   * Calls `event.preventDefault()` to stop the default page reload.
   * Collects form data via `new FormData(form)` and URL-encodes it.
   * Sends a `fetch()` POST to the `action` URL with appropriate headers.
   * On success (HTTP 200), hides the form and inserts a `<div>` with the `successBannerMessage`.
   * On error, hides the form and inserts a `<div>` displaying an error message from the response or a default “There was a problem submitting the form.”
   * This approach provides instant feedback without navigation.

### 8.2 ContactForm (`ContactForm.astro`)

**File:** `src/components/Form/ContactForm.astro`

This component specializes `Form.astro` for the site’s contact/quote form.

* **Imports:**

  ```js
  import Form from "~/components/Form/Form.astro";
  import TextInput from "~/components/Form/Fields/TextInput.astro";
  import Textarea  from "~/components/Form/Fields/Textarea.astro";
  import { getCurrentEntryId } from "~/utils/PageUtils";
  ```

* **Environment Variables:**

  * `PUBLIC_INTEGRATION_FORMSPREE` (e.g. `"https://formspree.io/f/"`)
  * `PUBLIC_CONTACT_FORM` (the unique Formspree form ID)

* **Compute `formAction`:**

  ```js
  const formAction = `${import.meta.env.PUBLIC_INTEGRATION_FORMSPREE}` +
                     `${import.meta.env.PUBLIC_CONTACT_FORM}`;
  ```

* **Hidden Context Field:**

  ```astro
  <input
    type="hidden"
    name="Page-of-Submission"
    value={getCurrentEntryId()}
  />
  ```

  Captures the current page or content slug so form submissions include context.

* **Actual Form Markup:**

  ```astro
  <Form
    action={formAction}
    showConsent={true}
    enableSuccessBanner={true}
    successBannerMessage="Thank you for your message. We'll be in touch soon."
    submitButtonText="Send Message"
  >
    <TextInput label="First Name" name="firstName" required />
    <TextInput label="Last Name"  name="lastName"  required />
    <TextInput label="Email"      name="email"     type="email" required />
    <TextInput label="Phone"      name="phone"     type="tel"    />
    <Textarea  label="Message"    name="message"   required />
    <input type="hidden" name="Page-of-Submission" value={getCurrentEntryId()} />
  </Form>
  ```

  * Fields map to Formspree’s expected POST parameters.
  * Consent checkbox is injected automatically.
  * Button text and success banner are customized via props.

### 8.3 Inline Script Workflow

The inline `<script>` included by `Form.astro` operates as follows:

1. **Selector & Event Binding:**

   ```js
   document.querySelectorAll('form[data-success-banner]')
     .forEach(form => form.addEventListener('submit', async event => { ... }));
   ```
2. **Prevent Default:** `event.preventDefault();`
3. **Serialize Data:**

   ```js
   const formData = new FormData(form);
   const body = new URLSearchParams(formData).toString();
   ```
4. **Fetch Submission:**

   ```js
   const response = await fetch(form.action, {
     method: form.method,
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       'Accept': 'application/json'
     },
     body
   });
   ```
5. **Handle Result:**

   * On `response.ok`:

     ```js
     form.style.display = 'none';
     showBanner(form.dataset.successMessage);
     ```
   * On error:

     ```js
     form.style.display = 'none';
     const errorMsg = (await response.json()).error || 'Problem submitting form.';
     showBanner(errorMsg);
     ```
6. **Banner Injection:** A `<div>` is created with appropriate CSS classes (`success-banner` or `error-banner`) and inserted immediately after the form.

With this pattern, developers can reuse `Form.astro` for any form by customizing props and slotting in different fields. The built-in script ensures consistent AJAX behavior and user feedback without full-page reloads.

## 9. Cookie & Privacy Policies

Cookie & Privacy Policies
*Dynamic contact insertion, cookie listing script placeholder, consent banners to implement.*