# Sivanaltar — i18n Implementation Summary

Full Hebrew / English bilingual support added across the entire site.

---

## URL Structure (SEO)

All pages live at language-prefixed URLs:

```
/he/Home      /en/Home
/he/Blog      /en/Blog
/he/Gallery   /en/Gallery
/he/Calendar  /en/Calendar
/he/Contact   /en/Contact
```

`/` redirects to `/${userPreferredLang}/Home`.

### Google SEO wiring
- `<html lang="he|en">` updated dynamically on every language change
- `<link rel="canonical">` injected per page/lang in `Layout.jsx`
- `<link rel="alternate" hreflang="he|en|x-default">` injected per page
- `public/sitemap.xml` includes both language variants with `xhtml:link` hreflang annotations

---

## Routing

**`src/App.jsx`**
- Routes: `/:lang` (home) and `/:lang/:pageName` (all pages)
- `LangSync` component reads `:lang` from URL param and calls `applyLang()` from context
- `DynamicPage` looks up `Pages[pageName]` from `pagesConfig`

**`src/utils/index.ts`**
- `createPageUrl(pageName)` now prepends `/${currentLang}/`
- Module-level `setCurrentLang()` called by `LanguageContext` on every lang change
- All internal `<Link>` and `window.location.href` calls get the lang prefix automatically

---

## Language Context

**`src/lib/LanguageContext.jsx`**
- `lang` state: `'he'` (default) or `'en'`
- `dir`: `'rtl'` for Hebrew, `'ltr'` for English
- `applyLang(lang)`: sets i18n locale, localStorage, `document.documentElement.lang/dir`, and calls `setCurrentLang`
- `setLang(lang)`: calls `applyLang` + persists to DB via `PATCH /api/users/me/lang`
- Both exposed via `useLang()` hook

**Language selector (`src/Layout.jsx`)**
- Dropdown with SVG flag icons (country-flag-icons library) — IL and US flags
- On change: navigates to `/${newLang}/${currentPageName}` — URL drives the lang, not state alone

---

## Translation Files

**`src/i18n/index.js`** — single file with `he` and `en` resource objects.

Key groups added:

| Prefix | Covers |
|---|---|
| `nav_*` | Navigation links |
| `footer_*` | Footer labels |
| `page_title_*` | Browser tab titles |
| `site_name`, `save`, `cancel`, `login`, `logout` | Global |
| `gallery_*` | Gallery page + section headers |
| `cal_*` | Calendar, BookingModal, AppointmentDetailModal, AdminSettingsModal, AdminAppointmentModal, SlotButton, MonthView |
| `cal_book_*` | Booking modal form fields |
| `cal_admin_*` | Admin add-appointment modal |
| `cal_detail_*` | Appointment detail modal |
| `cal_settings_*` | Admin working-hours settings |
| `cal_slot_*` | Slot buttons |
| `cal_month_*` | Month view labels |
| `chat_*` | AI floating chat assistant |
| `contact_*` | Contact page |
| `blog_*` | Blog page and post |
| `home_*` | Home page hero, CTA, section titles |
| `home_section_*_title` | Home section headers |

---

## Database Migrations

### `server/migrations/1749500000000_ai-config-lang.js`
- Adds `lang TEXT NOT NULL DEFAULT 'he'` to `ai_config`
- Drops single-column `UNIQUE(key)` constraint via PL/pgSQL DO block
- Adds `UNIQUE(key, lang)`
- Inserts English system prompt for AI guidance assistant

### `server/migrations/1749600000000_page-content-lang.js`
- Adds `lang TEXT NOT NULL DEFAULT 'he'` to `page_content`
- Same constraint migration pattern
- Inserts English content for all 4 home sections: `about_me`, `satya_method`, `how_it_works`, `coaching_value`

### `server/migrations/*_blog-lang.js`
- Adds `lang` column to `blog_posts`
- Existing posts tagged `he`

### Migration pattern (reusable)
```js
// 1. Add column
await pgm.db.query(`ALTER TABLE t ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'he'`);
// 2. Tag existing rows
await pgm.db.query(`UPDATE t SET lang = 'he' WHERE lang IS NULL OR lang = ''`);
// 3. Drop old UNIQUE(key) via PL/pgSQL
await pgm.db.query(`DO $$ DECLARE r RECORD; BEGIN FOR r IN
  SELECT con.conname FROM pg_constraint con
  JOIN pg_class cls ON cls.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = cls.oid AND att.attnum = ANY(con.conkey)
  WHERE cls.relname = 't' AND con.contype = 'u' AND att.attname = 'key'
    AND array_length(con.conkey, 1) = 1
  LOOP EXECUTE 'ALTER TABLE t DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP; END $$;`);
// 4. Add compound unique
await pgm.db.query(`ALTER TABLE t ADD CONSTRAINT t_key_lang_unique UNIQUE (key, lang)`);
```

---

## Backend

**`server/routes/functions.js`** (AI guidance)
- Receives `lang` from request body
- Queries `ai_config WHERE key='guidance_system_prompt' AND lang=$1`
- Builds history text and full prompt in correct language
- Sends gender-aware Hebrew prompt or standard English prompt

**`server/routes/users.js`** (`PATCH /api/users/me/lang`)
- Persists user language preference to `users.lang` column

---

## Translated Pages & Components

| File | What was translated |
|---|---|
| `src/Layout.jsx` | Nav links, footer, login/logout, page titles, hreflang injection |
| `src/pages/Home.jsx` | Hero quote/CTA, section titles; content loaded from DB by lang |
| `src/pages/Blog.jsx` | Page header, labels, empty state |
| `src/pages/BlogPost.jsx` | All labels, editor, publish controls |
| `src/pages/Gallery.jsx` | Section headers (SVG flags), modal labels, lightbox counter `dir="ltr"` |
| `src/pages/Calendar.jsx` | Welcome text, day names, week nav (date-fns `he`/`enUS` locale) |
| `src/pages/Contact.jsx` | All form labels, map, email sent message |
| `src/components/FloatingChat.jsx` | All labels, button/window position by `dir`, `lang` sent to API |
| `src/components/calendar/BookingModal.jsx` | Full form, locale-aware date format |
| `src/components/calendar/AdminAppointmentModal.jsx` | Full form, locale-aware date format |
| `src/components/calendar/AppointmentDetailModal.jsx` | All labels, date format |
| `src/components/calendar/AdminSettingsModal.jsx` | Day names, working hours form |
| `src/components/calendar/SlotButton.jsx` | Button text |
| `src/components/calendar/MonthView.jsx` | Day names, locale date format |
| `src/components/calendar/DatePickerWithRanges.jsx` | Date order: start→end in LTR, end→start in RTL |

---

## RTL / LTR Layout Details

- Root `<div dir={dir}>` on every page and modal
- `document.documentElement.dir` and `.lang` updated on lang change
- Calendar week nav arrows: `←` always = previous week, `→` always = next week; `dir={dir}` on container handles visual reversal in RTL
- MonthView prev/next arrows: same pattern
- FloatingChat button and window: `right-4` in RTL, `left-4` in LTR
- Gallery lightbox counter: `dir="ltr"` to keep `N / Total` format in both languages
- Date ranges: `start – end` in LTR, `end – start` in RTL

---

## Auth Consolidation (performance)

All components previously called `base44.auth.me()` independently, causing ~10 redundant `401` requests per page load for unauthenticated users. All components now consume `useAuth()` from `AuthContext`, which fetches once on app init and caches the result.

Affected: `Layout`, `Home`, `Blog`, `BlogPost`, `Gallery`, `Contact`, `Calendar`, `FloatingChat`, `PageNotFound`, `LanguageContext`.
