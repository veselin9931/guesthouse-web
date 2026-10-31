/*
 * Guesthouse site template. Renders the whole page from window.SITE (config.js).
 * Plain ES2020, no dependencies, no build step; works from file:// and any static host.
 */
(function (root) {
  "use strict";

  const FALLBACK_LANG = "bg";
  const LANG_STORAGE_KEY = "guesthouse-site-lang";
  const LANG_QUERY_PARAM = "lang";
  const SMALL_IMAGE_LONG_EDGE_PX = 800;
  const DEFAULT_IMAGE_WIDTH = 1600;
  const DEFAULT_IMAGE_HEIGHT = 1200;
  const MAP_HALF_SPAN_LAT = 0.007;
  const MAP_HALF_SPAN_LON = 0.012;
  const COORDINATE_DECIMALS = 5;
  const MS_PER_DAY = 86400000;
  const DEFAULT_GUEST_SELECTION = 2;
  const MAX_NAME_LENGTH = 80;
  const SWIPE_MIN_DISTANCE_PX = 50;
  const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const FONT_STACK_PATTERN = /^[\w\s,'"-]+$/;
  const ALLOWED_LINK_PROTOCOLS = ["https:", "http:", "mailto:", "tel:"];
  const GOOGLE_FONT_WEIGHTS = "400;600;700";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DEFAULT_COUNTRY_CALLING_CODE = "359";
  const MIN_INTERNATIONAL_DIGITS = 8;
  const MAX_INTERNATIONAL_DIGITS = 15;

  /* Static, trusted markup only: config values never reach innerHTML. */
  const ICONS = {
    wifi: '<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5 12a10 10 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
    parking: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5"/>',
    kitchen: '<path d="M3 11h18"/><path d="M5 11v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6"/><path d="M8.5 7.5c0-1.2 1-1.3 1-2.5M12 7.5c0-1.2 1-1.3 1-2.5M15.5 7.5c0-1.2 1-1.3 1-2.5"/>',
    ac: '<path d="M12 2v20M3.4 7l17.2 10M20.6 7 3.4 17"/><path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2"/>',
    bbq: '<path d="M4 10h16a8 8 0 0 1-16 0Z"/><path d="M8 17.3 6 22M16 17.3 18 22M12 18v4"/><path d="M9 6.5c0-1.5 1.5-1.5 1.5-3M13.5 6.5c0-1.5 1.5-1.5 1.5-3"/>',
    pets: '<circle cx="6.5" cy="10.5" r="1.8"/><circle cx="17.5" cy="10.5" r="1.8"/><circle cx="9.8" cy="6.2" r="1.8"/><circle cx="14.2" cy="6.2" r="1.8"/><path d="M12 12c-3 0-5.5 3.5-5.5 5.5 0 1.7 1.3 2.5 2.7 2.5 1.2 0 1.8-.6 2.8-.6s1.6.6 2.8.6c1.4 0 2.7-.8 2.7-2.5 0-2-2.5-5.5-5.5-5.5Z"/>',
    view: '<path d="m2 20 7-10 4 6 3-4 6 8Z"/><circle cx="17" cy="6" r="2"/>',
    fireplace: '<path d="M12 22c4 0 7-2.7 7-6.5 0-3.5-2.5-5.5-3.5-8.5-1 2-2 3-3.5 3.5C12.5 7 11 4 8.5 2 8.5 6 5 8.5 5 15.5 5 19.3 8 22 12 22Z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    guests: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    bed: '<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/>',
    bath: '<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z"/><path d="M6 12V5.5A2.5 2.5 0 0 1 8.5 3c1.2 0 2.1.8 2.4 1.9"/><path d="m7 19-1 2M17 19l1 2"/>',
    area: '<path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5"/>',
    phone: '<path d="M5 3h3.5l2 5-2.5 1.5a11 11 0 0 0 6.5 6.5l1.5-2.5 5 2V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5A8.5 8.5 0 1 1 21 11.5Z"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    calendarX: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M10 13l4 4M14 13l-4 4"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z"/>',
  };

  const SOCIAL_LABELS = {
    facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube",
    booking: "Booking.com", airbnb: "Airbnb", google: "Google",
  };

  /* ------------------------------------------------------------------ */
  /* Pure helpers (exported for tests)                                   */
  /* ------------------------------------------------------------------ */

  /** Resolves a per-language value ({bg, en, ...}) with fallback to BG, then to any language. */
  function localize(value, lang) {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object" || Array.isArray(value)) return value;
    if (value[lang] !== undefined && value[lang] !== "") return value[lang];
    if (value[FALLBACK_LANG] !== undefined) return value[FALLBACK_LANG];
    const anyLang = Object.keys(value)[0];
    return anyLang === undefined ? "" : value[anyLang];
  }

  function fillTemplate(template, params) {
    return String(template).replace(/\{(\w+)\}/g, (placeholder, key) =>
      Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : placeholder);
  }

  function isSafeLink(url) {
    if (typeof url !== "string" || url.trim() === "") return false;
    try {
      return ALLOWED_LINK_PROTOCOLS.includes(new URL(url).protocol);
    } catch (error) {
      return false;
    }
  }

  /**
   * Returns the number in E.164 form ("+359885477370") or "" when it cannot be used.
   * Accepts "+359 88…", "00359 88…" and Bulgarian local numbers "088…" (country code 359 is assumed).
   */
  function normalizePhone(phone) {
    const compact = String(phone || "").trim().replace(/[\s().\/-]/g, "");
    let digits = "";
    if (/^\+\d+$/.test(compact)) digits = compact.slice(1);
    else if (/^00\d+$/.test(compact)) digits = compact.slice(2);
    else if (/^0\d+$/.test(compact)) digits = DEFAULT_COUNTRY_CALLING_CODE + compact.slice(1);
    const hasValidLength = digits.length >= MIN_INTERNATIONAL_DIGITS && digits.length <= MAX_INTERNATIONAL_DIGITS;
    return hasValidLength ? "+" + digits : "";
  }

  function toPhoneDigits(phone) {
    return normalizePhone(phone).slice(1);
  }

  function buildTelUrl(phone) {
    const normalized = normalizePhone(phone);
    return normalized ? "tel:" + normalized : "";
  }

  function buildViberUrl(phone, text) {
    const digits = toPhoneDigits(phone);
    if (!digits) return "";
    const base = "viber://chat?number=%2B" + digits;
    return text ? base + "&draft=" + encodeURIComponent(text) : base;
  }

  function buildWhatsAppUrl(phone, text) {
    const digits = toPhoneDigits(phone);
    if (!digits) return "";
    const base = "https://wa.me/" + digits;
    return text ? base + "?text=" + encodeURIComponent(text) : base;
  }

  function buildMailtoUrl(email, subject, body) {
    const query = [];
    if (subject) query.push("subject=" + encodeURIComponent(subject));
    if (body) query.push("body=" + encodeURIComponent(body));
    const address = encodeURIComponent(String(email || "").trim()).replace(/%40/g, "@");
    return "mailto:" + address + (query.length ? "?" + query.join("&") : "");
  }

  function buildOsmEmbedUrl(lat, lon) {
    const bbox = [lon - MAP_HALF_SPAN_LON, lat - MAP_HALF_SPAN_LAT, lon + MAP_HALF_SPAN_LON, lat + MAP_HALF_SPAN_LAT]
      .map((value) => value.toFixed(COORDINATE_DECIMALS))
      .join(",");
    return "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox +
      "&layer=mapnik&marker=" + lat.toFixed(COORDINATE_DECIMALS) + "," + lon.toFixed(COORDINATE_DECIMALS);
  }

  function buildGoogleMapsUrl(lat, lon) {
    return "https://www.google.com/maps/search/?api=1&query=" + lat + "%2C" + lon;
  }

  function smallVariantWidth(image) {
    const width = image.w || DEFAULT_IMAGE_WIDTH;
    const height = image.h || DEFAULT_IMAGE_HEIGHT;
    const longEdge = Math.max(width, height);
    return longEdge <= SMALL_IMAGE_LONG_EDGE_PX ? width : Math.round(width * SMALL_IMAGE_LONG_EDGE_PX / longEdge);
  }

  /** "small.jpg 800w, large.jpg 1600w" for images prepared by tools/prepare_photos.py. */
  function buildSrcset(image) {
    if (!image.srcSmall) return "";
    return image.srcSmall + " " + smallVariantWidth(image) + "w, " + image.src + " " + (image.w || DEFAULT_IMAGE_WIDTH) + "w";
  }

  function toIsoDate(date) {
    const pad = (number) => String(number).padStart(2, "0");
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function isoToUtcMs(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }

  function addDaysIso(iso, days) {
    return new Date(isoToUtcMs(iso) + days * MS_PER_DAY).toISOString().slice(0, 10);
  }

  function countNights(fromIso, toIso) {
    return Math.round((isoToUtcMs(toIso) - isoToUtcMs(fromIso)) / MS_PER_DAY);
  }

  function validateArrival(from, today) {
    if (!ISO_DATE_PATTERN.test(from)) return { key: "errorFromRequired" };
    if (from < today) return { key: "errorFromPast" };
    return null;
  }

  function validateDeparture(from, to, minNights) {
    if (!ISO_DATE_PATTERN.test(to)) return { key: "errorToRequired" };
    if (!ISO_DATE_PATTERN.test(from)) return null;
    if (to <= from) return { key: "errorToBeforeFrom" };
    if (countNights(from, to) < minNights) return { key: "errorMinStay", count: minNights };
    return null;
  }

  function validateGuests(guests, maxGuests, unitCapacity) {
    const count = Number(guests);
    const isInRange = Number.isInteger(count) && count >= 1 && count <= maxGuests;
    if (!isInRange) return { key: "errorGuests", count: maxGuests };
    if (unitCapacity && count > unitCapacity) return { key: "errorGuestsUnit", count: unitCapacity };
    return null;
  }

  function validateName(name) {
    const trimmed = String(name || "").trim();
    return trimmed && trimmed.length <= MAX_NAME_LENGTH ? null : { key: "errorName" };
  }

  /**
   * Returns { field: { key, count? } } for every invalid field; empty object when valid.
   * limits: { today, maxGuests, minNights, unitCapacity? } (unitCapacity = capacity of the chosen room).
   */
  function validateInquiry(values, limits) {
    const checks = {
      from: validateArrival(values.from, limits.today),
      to: validateDeparture(values.from, values.to, limits.minNights || 1),
      guests: validateGuests(values.guests, limits.maxGuests, limits.unitCapacity),
      name: validateName(values.name),
    };
    return Object.fromEntries(Object.entries(checks).filter((entry) => entry[1] !== null));
  }

  function composeInquiryLines(details, strings) {
    const lines = details.guestLanguageNote ? [details.guestLanguageNote] : [];
    lines.push(
      fillTemplate(strings.messageGreeting, { property: details.propertyName }),
      "",
      fillTemplate(strings.messageDates, { from: details.fromLabel, to: details.toLabel, nights: details.nightsLabel }),
      fillTemplate(strings.messageGuests, { count: details.guests })
    );
    if (details.unitName) lines.push(fillTemplate(strings.messageUnit, { unit: details.unitName }));
    lines.push(fillTemplate(strings.messageName, { name: details.name }));
    if (details.message) lines.push("", details.message);
    return lines;
  }

  function absoluteUrl(site, path) {
    if (!path || !site.siteUrl) return path || "";
    try {
      return new URL(path, site.siteUrl).href;
    } catch (error) {
      return path;
    }
  }

  function pageUrlFor(site, code) {
    if (!site.siteUrl) return "";
    const defaultLang = site.defaultLanguage || FALLBACK_LANG;
    return code === defaultLang ? site.siteUrl : site.siteUrl + "?" + LANG_QUERY_PARAM + "=" + code;
  }

  function hasCoordinates(site) {
    const geo = site.geo || {};
    return typeof geo.lat === "number" && typeof geo.lon === "number";
  }

  function buildPostalAddress(address, lang) {
    return {
      "@type": "PostalAddress",
      streetAddress: localize(address.street, lang),
      addressLocality: localize(address.city, lang),
      postalCode: address.postalCode || undefined,
      addressRegion: localize(address.region, lang) || undefined,
      addressCountry: address.country || undefined,
    };
  }

  /** schema.org LodgingBusiness; aggregateRating is included only when the config provides it. */
  function buildStructuredData(site, lang) {
    const contact = site.contact || {};
    const rules = site.rules || {};
    const seo = site.seo || {};
    const data = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: localize(site.property && site.property.name, lang),
      description: localize(seo.description, lang) || undefined,
      url: site.siteUrl || undefined,
      image: seo.image ? absoluteUrl(site, seo.image) : undefined,
      telephone: normalizePhone(contact.phone) || undefined,
      email: contact.email || undefined,
      priceRange: (site.booking && site.booking.priceRange) || undefined,
      address: buildPostalAddress(site.address || {}, lang),
      checkinTime: rules.checkIn || undefined,
      checkoutTime: rules.checkOut || undefined,
      sameAs: (site.socials || []).filter((social) => isSafeLink(social.url)).map((social) => social.url),
    };
    if (hasCoordinates(site)) data.geo = { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lon };
    const rating = site.aggregateRating;
    if (rating && rating.ratingValue && rating.reviewCount) {
      data.aggregateRating = { "@type": "AggregateRating", ratingValue: rating.ratingValue, reviewCount: rating.reviewCount, bestRating: rating.bestRating || 5 };
    }
    return data;
  }

  /*
   * Explicit choices only (?lang= first, then the saved choice). Browser-language detection is
   * deliberately skipped: search crawlers render with an English browser and would index the
   * default-language URL with English content.
   */
  function resolveInitialLang(sources, supported, defaultLang) {
    const candidates = [sources.query, sources.stored]
      .filter(Boolean)
      .map((code) => String(code).toLowerCase());
    return candidates.find((code) => supported.includes(code)) || defaultLang;
  }

  /* ------------------------------------------------------------------ */
  /* Browser app                                                         */
  /* ------------------------------------------------------------------ */

  function startApp(site) {
    const languages = (site.languages || []).filter((language) => language && language.code);
    const supportedCodes = languages.map((language) => language.code);
    const defaultLang = site.defaultLanguage || supportedCodes[0] || FALLBACK_LANG;
    const state = { lang: defaultLang };
    const byId = (id) => document.getElementById(id);

    /* ---------- i18n ---------- */

    function uiIn(lang, key, params) {
      const strings = site.ui || {};
      const template = (strings[lang] && strings[lang][key]) ||
        (strings[FALLBACK_LANG] && strings[FALLBACK_LANG][key]) || "";
      return params ? fillTemplate(template, params) : template;
    }

    function ui(key, params) {
      return uiIn(state.lang, key, params);
    }

    function text(value) {
      return localize(value, state.lang);
    }

    function localeOf(lang) {
      const language = languages.find((entry) => entry.code === lang);
      return (language && language.locale) || lang;
    }

    function locale() {
      return localeOf(state.lang);
    }

    function languageNameKey(code) {
      return "langName" + code.charAt(0).toUpperCase() + code.slice(1);
    }

    function formatPrice(amount) {
      const currency = (site.booking && site.booking.currency) || "EUR";
      return new Intl.NumberFormat(locale(), { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
    }

    function formatNights(count, lang) {
      const targetLang = lang || state.lang;
      const category = new Intl.PluralRules(localeOf(targetLang)).select(count);
      return uiIn(targetLang, category === "one" ? "nightsOne" : "nightsOther", { count });
    }

    function formatDate(iso, lang) {
      const [year, month, day] = iso.split("-").map(Number);
      return new Intl.DateTimeFormat(localeOf(lang || state.lang), { day: "numeric", month: "short", year: "numeric" })
        .format(new Date(year, month - 1, day));
    }

    function readStoredLang() {
      try {
        return root.localStorage.getItem(LANG_STORAGE_KEY);
      } catch (error) {
        return null;
      }
    }

    function storeLang(lang) {
      try {
        root.localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch (error) {
        console.warn("Language preference not saved (storage unavailable):", error.message);
      }
    }

    function writeLangToUrl(lang) {
      try {
        const url = new URL(root.location.href);
        if (lang === defaultLang) url.searchParams.delete(LANG_QUERY_PARAM);
        else url.searchParams.set(LANG_QUERY_PARAM, lang);
        root.history.replaceState(null, "", url.href);
      } catch (error) {
        console.warn("Language not written to URL (e.g. opened from file://):", error.message);
      }
    }

    function initialLang() {
      const query = new URLSearchParams(root.location.search).get(LANG_QUERY_PARAM);
      return resolveInitialLang({ query, stored: readStoredLang() }, supportedCodes, defaultLang);
    }

    /* ---------- DOM helpers ---------- */

    function h(tag, props, children) {
      const node = document.createElement(tag);
      Object.entries(props || {}).forEach(([key, value]) => {
        if (value === null || value === undefined || value === false) return;
        if (key === "text") node.textContent = value;
        else if (key === "className") node.className = value;
        else node.setAttribute(key, value === true ? "" : String(value));
      });
      (children || []).forEach((child) => {
        if (child !== null && child !== undefined && child !== false) node.append(child);
      });
      return node;
    }

    function icon(name, className) {
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      svg.setAttribute("class", "icon" + (className ? " " + className : ""));
      svg.innerHTML = Object.prototype.hasOwnProperty.call(ICONS, name) ? ICONS[name] : ICONS.check;
      return svg;
    }

    function setIcon(element, name) {
      element.replaceChildren(icon(name));
    }

    function externalLink(href, label, className) {
      return h("a", { href, className, target: "_blank", rel: "noopener noreferrer", text: label });
    }

    /** Builds an <img> with intrinsic size (no layout shift) and an 800px/1600px srcset when available. */
    function picture(image, options) {
      const settings = options || {};
      const hasSmall = Boolean(image.srcSmall);
      const img = h("img", {
        src: hasSmall && settings.preferSmall ? image.srcSmall : image.src,
        alt: text(image.alt),
        width: image.w || DEFAULT_IMAGE_WIDTH,
        height: image.h || DEFAULT_IMAGE_HEIGHT,
        loading: settings.eager ? "eager" : "lazy",
        decoding: "async",
        fetchpriority: settings.eager ? "high" : null,
        sizes: hasSmall ? settings.sizes || "100vw" : null,
        className: settings.className,
      });
      if (hasSmall) img.srcset = buildSrcset(image);
      return img;
    }

    function hasImage(image) {
      return Boolean(image && image.src);
    }

    function toggleSection(id, isVisible) {
      byId(id).hidden = !isVisible;
      const navLink = document.querySelector('.nav-list a[href="#' + id + '"]');
      if (navLink) navLink.parentElement.hidden = !isVisible;
    }

    /** Isolates failures: one broken config block hides its section instead of breaking the page. */
    function safeRender(sectionId, render) {
      try {
        render();
      } catch (error) {
        console.error("Could not render section '" + sectionId + "'. Check config.js.", error);
        if (sectionId && byId(sectionId)) toggleSection(sectionId, false);
      }
    }

    /* ---------- theme ---------- */

    const THEME_COLOR_VARIABLES = { primary: "--color-primary", accent: "--color-accent", background: "--color-bg", text: "--color-text" };

    function applyThemeColors(theme) {
      Object.entries(THEME_COLOR_VARIABLES).forEach(([key, variable]) => {
        const value = theme[key];
        if (!value) return;
        if (root.CSS && root.CSS.supports && !root.CSS.supports("color", value)) {
          console.warn("Ignoring invalid theme color " + key + ": " + value);
          return;
        }
        document.documentElement.style.setProperty(variable, value);
      });
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta && theme.primary) themeColorMeta.setAttribute("content", theme.primary);
    }

    function firstFontFamily(stack) {
      return stack.split(",")[0].replace(/["']/g, "").trim();
    }

    function applyThemeFonts(theme) {
      const stacks = { "--font-heading": theme.fontHeading, "--font-body": theme.fontBody };
      const families = [];
      Object.entries(stacks).forEach(([variable, stack]) => {
        if (!stack) return;
        if (!FONT_STACK_PATTERN.test(stack)) {
          console.warn("Ignoring invalid font stack: " + stack);
          return;
        }
        document.documentElement.style.setProperty(variable, stack);
        families.push(firstFontFamily(stack));
      });
      if (theme.googleFonts === true && families.length) loadGoogleFonts(families);
    }

    function loadGoogleFonts(families) {
      const uniqueFamilies = Array.from(new Set(families));
      const query = uniqueFamilies
        .map((family) => "family=" + encodeURIComponent(family).replace(/%20/g, "+") + ":wght@" + GOOGLE_FONT_WEIGHTS)
        .join("&");
      document.head.append(h("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?" + query + "&display=swap" }));
    }

    /* ---------- static UI strings ---------- */

    function applyUiStrings() {
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = ui(element.getAttribute("data-i18n"));
      });
      document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
        const [attribute, key] = element.getAttribute("data-i18n-attr").split(":");
        element.setAttribute(attribute, ui(key));
      });
    }

    /* ---------- header & language switch ---------- */

    function languageCode(language) {
      return language.label || language.code.toUpperCase();
    }

    /* The visible code stays inside the accessible name ("BG – Български"), per WCAG 2.5.3. */
    function languageLink(language) {
      const link = h("a", { href: "?" + LANG_QUERY_PARAM + "=" + language.code, hreflang: language.code, lang: language.code, "data-lang": language.code }, [
        h("span", { text: languageCode(language) }),
        h("span", { className: "visually-hidden", text: " – " + (language.name || language.code) }),
      ]);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        switchLanguage(language.code);
      });
      return link;
    }

    /** Full link row on wider screens; a native <select> below 400px (see styles.css). */
    function renderLanguageSwitch() {
      const isMultilingual = languages.length > 1;
      const select = byId("lang-select");
      byId("lang-switch").hidden = !isMultilingual;
      byId("lang-compact").hidden = !isMultilingual;
      if (!isMultilingual) return;
      byId("lang-switch").replaceChildren(...languages.map(languageLink));
      select.replaceChildren(...languages.map((language) =>
        h("option", { value: language.code, lang: language.code, text: languageCode(language) })));
      select.addEventListener("change", () => switchLanguage(select.value));
    }

    function markActiveLanguage() {
      byId("lang-switch").querySelectorAll("a").forEach((link) => {
        if (link.getAttribute("data-lang") === state.lang) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      byId("lang-select").value = state.lang;
    }

    function renderBrand() {
      byId("brand-link").textContent = text(site.property.name);
    }

    function renderDemoRibbon() {
      const ribbon = byId("demo-ribbon");
      ribbon.hidden = !site.demo;
      ribbon.textContent = ui("demoRibbon");
    }

    /* ---------- hero & about ---------- */

    function renderHero() {
      const hero = site.hero || {};
      const media = byId("hero-media");
      media.replaceChildren();
      if (hasImage(hero.image)) {
        media.append(picture(hero.image, { eager: true, sizes: "100vw", className: "hero__image" }));
      }
      byId("hero-eyebrow").textContent = text(hero.eyebrow);
      byId("hero-title").textContent = text(site.property.name);
      byId("hero-lead").textContent = text(hero.lead);
      byId("hero-highlights").replaceChildren(...(hero.highlights || []).map((item) =>
        h("li", {}, [h("strong", { text: text(item.value) }), h("span", { text: text(item.label) })])));
    }

    function renderParagraphs(container, paragraphs) {
      const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
      container.replaceChildren(...list.filter(Boolean).map((paragraph) => h("p", { text: paragraph })));
    }

    function renderAbout() {
      const about = site.about || {};
      byId("about-title").textContent = text(about.title);
      renderParagraphs(byId("about-body"), text(about.text));
      const media = byId("about-media");
      media.replaceChildren();
      media.hidden = !hasImage(about.image);
      if (hasImage(about.image)) {
        media.append(picture(about.image, { sizes: "(min-width: 900px) 40vw, 100vw", preferSmall: true }));
      }
      toggleSection("about", Boolean(text(about.title) || text(about.text)));
    }

    /* ---------- units ---------- */

    function unitFact(iconName, label) {
      return label ? h("li", {}, [icon(iconName), h("span", { text: label })]) : null;
    }

    function unitPrice(unit) {
      if (typeof unit.priceFrom !== "number") return h("p", { className: "unit-card__price", text: ui("priceOnRequest") });
      return h("p", { className: "unit-card__price", text: ui("priceFrom", { price: formatPrice(unit.priceFrom) }) });
    }

    function renderUnitCard(unit, index) {
      const name = text(unit.name);
      const facts = h("ul", { className: "unit-card__facts" }, [
        unitFact("guests", unit.capacity ? ui("guestsUpTo", { count: unit.capacity }) : ""),
        unitFact("bed", text(unit.beds)),
        unitFact("bath", text(unit.bathroom)),
        unitFact("area", unit.areaM2 ? ui("areaValue", { area: unit.areaM2 }) : ""),
      ]);
      const inquireButton = h("button", { type: "button", className: "button button--outline button--small", "aria-label": ui("unitInquireLabel", { name }), text: ui("unitInquire") });
      inquireButton.addEventListener("click", () => openInquiry({ unitIndex: index }));
      return h("li", { className: "unit-card" }, [
        hasImage(unit.image)
          ? h("div", { className: "unit-card__media" }, [picture(unit.image, { sizes: "(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw", preferSmall: true })])
          : null,
        h("div", { className: "unit-card__body" }, [
          h("h3", { className: "unit-card__title", text: name }),
          text(unit.description) ? h("p", { className: "unit-card__text", text: text(unit.description) }) : null,
          facts,
          h("div", { className: "unit-card__footer" }, [unitPrice(unit), inquireButton]),
        ]),
      ]);
    }

    function renderUnits() {
      const units = site.units || [];
      byId("unit-list").replaceChildren(...units.map(renderUnitCard));
      toggleSection("rooms", units.length > 0);
    }

    /* ---------- gallery & lightbox ---------- */

    const lightbox = { index: 0, trigger: null, pointerStartX: null };

    function galleryItems() {
      return (site.gallery || []).filter(hasImage);
    }

    function renderGallery() {
      const items = galleryItems();
      const list = byId("gallery-list");
      list.replaceChildren(...items.map((image, index) => {
        const button = h("button", {
          type: "button",
          className: "gallery-item",
          "aria-label": ui("galleryOpen", { index: index + 1, total: items.length }) + (text(image.alt) ? ": " + text(image.alt) : ""),
        }, [picture(image, { sizes: "(min-width: 900px) 25vw, 50vw", preferSmall: true })]);
        button.addEventListener("click", () => openLightbox(index, button));
        return h("li", {}, [button]);
      }));
      toggleSection("gallery", items.length > 0);
    }

    function showLightboxImage(index) {
      const items = galleryItems();
      lightbox.index = (index + items.length) % items.length;
      const image = items[lightbox.index];
      const img = byId("lightbox-image");
      img.width = image.w || DEFAULT_IMAGE_WIDTH;
      img.height = image.h || DEFAULT_IMAGE_HEIGHT;
      img.src = image.src;
      const caption = text(image.alt);
      img.alt = "";
      byId("lightbox-caption").textContent = caption;
      byId("lightbox-caption").hidden = !caption;
      byId("lightbox-counter").textContent = ui("lightboxCounter", { index: lightbox.index + 1, total: items.length });
    }

    function openLightbox(index, trigger) {
      const dialog = byId("lightbox");
      if (typeof dialog.showModal !== "function") {
        root.open(galleryItems()[index].src, "_blank", "noopener");
        return;
      }
      lightbox.trigger = trigger;
      showLightboxImage(index);
      dialog.showModal();
      document.documentElement.classList.add("has-modal");
      byId("lightbox-close").focus();
    }

    function closeLightbox() {
      const dialog = byId("lightbox");
      if (dialog.open) dialog.close();
    }

    function handleLightboxKeys(event) {
      if (event.key === "ArrowLeft") showLightboxImage(lightbox.index - 1);
      else if (event.key === "ArrowRight") showLightboxImage(lightbox.index + 1);
      else return;
      event.preventDefault();
    }

    function handleLightboxSwipeEnd(event) {
      if (lightbox.pointerStartX === null) return;
      const distance = event.clientX - lightbox.pointerStartX;
      lightbox.pointerStartX = null;
      if (Math.abs(distance) < SWIPE_MIN_DISTANCE_PX) return;
      showLightboxImage(lightbox.index + (distance < 0 ? 1 : -1));
    }

    function setupLightbox() {
      const dialog = byId("lightbox");
      setIcon(byId("lightbox-close"), "close");
      setIcon(byId("lightbox-prev"), "chevronLeft");
      setIcon(byId("lightbox-next"), "chevronRight");
      byId("lightbox-close").addEventListener("click", closeLightbox);
      byId("lightbox-prev").addEventListener("click", () => showLightboxImage(lightbox.index - 1));
      byId("lightbox-next").addEventListener("click", () => showLightboxImage(lightbox.index + 1));
      dialog.addEventListener("keydown", handleLightboxKeys);
      dialog.addEventListener("pointerdown", (event) => { lightbox.pointerStartX = event.clientX; });
      dialog.addEventListener("pointerup", handleLightboxSwipeEnd);
      dialog.addEventListener("pointercancel", () => { lightbox.pointerStartX = null; });
      dialog.addEventListener("close", () => {
        document.documentElement.classList.remove("has-modal");
        if (lightbox.trigger) lightbox.trigger.focus();
      });
    }

    /* ---------- amenities & rules ---------- */

    function renderAmenities() {
      const amenities = site.amenities || [];
      byId("amenity-list").replaceChildren(...amenities.map((amenity) =>
        h("li", { className: "amenity" }, [
          h("span", { className: "amenity__icon" }, [icon(amenity.icon)]),
          h("span", { className: "amenity__label", text: text(amenity.label) }),
        ])));
      toggleSection("amenities", amenities.length > 0);
    }

    function ruleEntries(rules) {
      return [
        rules.checkIn && ["clock", ui("checkIn"), ui("checkInValue", { time: rules.checkIn })],
        rules.checkOut && ["clock", ui("checkOut"), ui("checkOutValue", { time: rules.checkOut })],
        rules.minNights && ["moon", ui("minStay"), formatNights(rules.minNights)],
        rules.pets && ["pets", ui("pets"), text(rules.pets)],
        rules.payment && ["card", ui("payment"), text(rules.payment)],
        rules.cancellation && ["calendarX", ui("cancellation"), text(rules.cancellation)],
      ].filter(Boolean);
    }

    function renderRules() {
      const rules = site.rules || {};
      const entries = ruleEntries(rules);
      byId("rule-list").replaceChildren(...entries.map(([iconName, label, value]) =>
        h("div", { className: "rule" }, [
          h("dt", {}, [icon(iconName), h("span", { text: label })]),
          h("dd", { text: value }),
        ])));
      const notes = (rules.notes || []).map(text).filter(Boolean);
      byId("rule-notes").replaceChildren(...notes.map((note) => h("li", { text: note })));
      byId("rule-notes").hidden = notes.length === 0;
      toggleSection("rules", entries.length > 0 || notes.length > 0);
    }

    /* ---------- location ---------- */


    function mapsUrl() {
      const custom = site.location && site.location.mapsUrl;
      if (isSafeLink(custom)) return custom;
      return hasCoordinates(site) ? buildGoogleMapsUrl(site.geo.lat, site.geo.lon) : "";
    }

    function addressLines() {
      const address = site.address || {};
      const cityLine = [address.postalCode, text(address.city)].filter(Boolean).join(" ");
      return [text(address.street), cityLine, text(address.region)].filter(Boolean);
    }

    function renderMap() {
      const holder = byId("map-frame-holder");
      holder.hidden = !hasCoordinates(site);
      if (!hasCoordinates(site)) return;
      const src = buildOsmEmbedUrl(site.geo.lat, site.geo.lon);
      const existing = holder.querySelector("iframe");
      const title = ui("mapTitle", { name: text(site.property.name) });
      if (existing && existing.getAttribute("src") === src) {
        existing.title = title;
        return;
      }
      holder.replaceChildren(h("iframe", { src, title, loading: "lazy", referrerpolicy: "strict-origin-when-cross-origin" }));
    }

    function renderLocation() {
      const address = byId("location-address");
      address.replaceChildren(icon("pin"), h("span", {}, addressLines().map((line) => h("span", { className: "address-line", text: line }))));
      const distances = (site.location && site.location.distances) || [];
      byId("distance-list").replaceChildren(...distances.map((distance) =>
        h("li", {}, [
          h("strong", { text: ui("distanceValue", { km: distance.km }) }),
          h("span", { text: text(distance.label) }),
        ])));
      const link = byId("maps-link");
      link.hidden = !mapsUrl();
      link.href = mapsUrl() || "#";
      link.textContent = ui("openInMaps");
      renderMap();
    }

    /* ---------- reviews ---------- */

    function renderBadge(badge) {
      const content = [
        icon("star", "icon--star"),
        h("strong", { text: badge.score ? badge.label + " " + badge.score : badge.label }),
        text(badge.note) ? h("span", { text: text(badge.note) }) : null,
      ];
      const inner = isSafeLink(badge.url)
        ? h("a", { href: badge.url, target: "_blank", rel: "noopener noreferrer", className: "badge" }, content)
        : h("span", { className: "badge" }, content);
      return h("li", {}, [inner]);
    }

    function renderReview(review) {
      const author = [review.author, review.source].filter(Boolean).join(" · ");
      return h("li", { className: "review" }, [
        h("figure", {}, [
          h("blockquote", { lang: review.lang || null }, [h("p", { text: text(review.text) })]),
          author ? h("figcaption", { text: "— " + author }) : null,
        ]),
      ]);
    }

    function renderReviews() {
      const reviews = site.reviews || {};
      const badges = (reviews.badges || []).filter((badge) => badge && badge.label);
      const items = (reviews.items || []).filter((review) => review && text(review.text));
      byId("badge-list").replaceChildren(...badges.map(renderBadge));
      byId("badge-list").hidden = badges.length === 0;
      byId("review-list").replaceChildren(...items.map(renderReview));
      byId("review-list").hidden = items.length === 0;
      toggleSection("reviews", badges.length > 0 || items.length > 0);
    }

    /* ---------- inquiry ---------- */

    const contact = site.contact || {};
    const phones = {
      phone: normalizePhone(contact.phone),
      viber: normalizePhone(contact.viber),
      whatsapp: normalizePhone(contact.whatsapp),
    };
    /* The composed message is always in the site's default language, so the host can read it. */
    const hostLang = defaultLang;
    const MESSAGE_STRING_KEYS = ["messageGreeting", "messageDates", "messageGuests", "messageUnit", "messageName"];

    function phoneLabel() {
      return contact.phoneDisplay || contact.phone;
    }

    function maxGuests() {
      return (site.booking && site.booking.maxGuests) || 1;
    }

    function inquiryFields() {
      return {
        from: byId("field-from"), to: byId("field-to"), guests: byId("field-guests"),
        unit: byId("field-unit"), name: byId("field-name"), message: byId("field-message"),
      };
    }

    function selectedUnit(unitIndex) {
      if (unitIndex === "" || unitIndex === undefined) return null;
      return (site.units || [])[Number(unitIndex)] || null;
    }

    function renderGuestOptions() {
      const select = byId("field-guests");
      const previous = select.value || String(Math.min(DEFAULT_GUEST_SELECTION, maxGuests()));
      select.replaceChildren(...Array.from({ length: maxGuests() }, (unused, index) =>
        h("option", { value: index + 1, text: String(index + 1) })));
      select.value = previous;
    }

    function renderUnitOptions() {
      const units = site.units || [];
      const select = byId("field-unit");
      const previous = select.value;
      byId("field-unit-wrapper").hidden = units.length < 2;
      select.replaceChildren(
        h("option", { value: "", text: ui("unitAny") }),
        ...units.map((unit, index) => h("option", { value: String(index), text: text(unit.name) })));
      select.value = previous;
    }

    function syncDateLimits() {
      const fields = inquiryFields();
      const today = toIsoDate(new Date());
      fields.from.min = today;
      const earliestDeparture = ISO_DATE_PATTERN.test(fields.from.value) ? fields.from.value : today;
      fields.to.min = addDaysIso(earliestDeparture, (site.rules && site.rules.minNights) || 1);
    }

    function contactItem(link) {
      return h("li", {}, [link]);
    }

    function externalLinkWithIcon(href, iconName, label) {
      return h("a", { href, target: "_blank", rel: "noopener noreferrer" }, [icon(iconName), h("span", { text: label })]);
    }

    function renderDirectContacts() {
      const items = [];
      if (phones.phone) items.push(contactItem(h("a", { href: buildTelUrl(phones.phone) }, [icon("phone"), h("span", { text: phoneLabel() })])));
      if (phones.viber) items.push(contactItem(h("a", { href: buildViberUrl(phones.viber) }, [icon("chat"), h("span", { text: "Viber" })])));
      if (phones.whatsapp) items.push(contactItem(externalLinkWithIcon(buildWhatsAppUrl(phones.whatsapp), "chat", "WhatsApp")));
      if (contact.email) items.push(contactItem(h("a", { href: buildMailtoUrl(contact.email) }, [icon("mail"), h("span", { text: contact.email })])));
      byId("direct-contacts").replaceChildren(...items);
    }

    function readInquiryValues() {
      const fields = inquiryFields();
      return {
        from: fields.from.value,
        to: fields.to.value,
        guests: fields.guests.value,
        unitIndex: fields.unit.value,
        name: fields.name.value.trim(),
        message: fields.message.value.trim(),
      };
    }

    function errorMessage(error, unit) {
      if (error.key === "errorMinStay") return ui("errorMinStay", { nights: formatNights(error.count) });
      if (error.key === "errorGuests") return ui("errorGuests", { max: error.count });
      if (error.key === "errorGuestsUnit") return ui("errorGuestsUnit", { max: error.count, unit: unit ? text(unit.name) : "" });
      return ui(error.key);
    }

    function showFieldErrors(errors, unit) {
      const fields = inquiryFields();
      ["from", "to", "guests", "name"].forEach((fieldName) => {
        const message = byId("error-" + fieldName);
        const error = errors[fieldName];
        message.hidden = !error;
        message.textContent = error ? errorMessage(error, unit) : "";
        if (error) fields[fieldName].setAttribute("aria-invalid", "true");
        else fields[fieldName].removeAttribute("aria-invalid");
      });
    }

    function guestLanguageNote() {
      if (state.lang === hostLang) return "";
      return uiIn(hostLang, "messageGuestLanguage", { language: uiIn(hostLang, languageNameKey(state.lang)) });
    }

    function buildInquiryText(values) {
      const unit = selectedUnit(values.unitIndex);
      const strings = Object.fromEntries(MESSAGE_STRING_KEYS.map((key) => [key, uiIn(hostLang, key)]));
      return composeInquiryLines({
        guestLanguageNote: guestLanguageNote(),
        propertyName: localize(site.property.name, hostLang),
        fromLabel: formatDate(values.from, hostLang),
        toLabel: formatDate(values.to, hostLang),
        nightsLabel: formatNights(countNights(values.from, values.to), hostLang),
        guests: values.guests,
        unitName: unit ? localize(unit.name, hostLang) : "",
        name: values.name,
        message: values.message,
      }, strings);
    }

    function sendButton(href, iconName, label, isExternal) {
      return h("a", {
        href,
        className: "button button--send",
        target: isExternal ? "_blank" : null,
        rel: isExternal ? "noopener noreferrer" : null,
      }, [icon(iconName), h("span", { text: label })]);
    }

    function renderSendButtons(lines, values) {
      const chatText = lines.join("\n");
      const subject = uiIn(hostLang, "emailSubject", { from: formatDate(values.from, hostLang), to: formatDate(values.to, hostLang) });
      const buttons = [];
      if (phones.viber) {
        const viberButton = sendButton(buildViberUrl(phones.viber, chatText), "chat", ui("sendViber"), false);
        viberButton.addEventListener("click", () => copyMessage(ui("viberHint")));
        buttons.push(viberButton);
      }
      if (phones.whatsapp) buttons.push(sendButton(buildWhatsAppUrl(phones.whatsapp, chatText), "chat", ui("sendWhatsApp"), true));
      if (contact.email) buttons.push(sendButton(buildMailtoUrl(contact.email, subject, lines.join("\r\n")), "mail", ui("sendEmail"), false));
      if (phones.phone) buttons.push(sendButton(buildTelUrl(phones.phone), "phone", ui("callNow") + " " + phoneLabel(), false));
      const copyButton = h("button", { type: "button", className: "button button--send" }, [icon("copy"), h("span", { text: ui("copyMessage") })]);
      copyButton.addEventListener("click", () => copyMessage(ui("copied")));
      buttons.push(copyButton);
      byId("send-buttons").replaceChildren(...buttons);
    }

    /* Shown before the guest taps anything: Viber may ignore the draft text on some versions. */
    function renderResultNotes() {
      const languageNote = byId("message-language-note");
      languageNote.hidden = state.lang === hostLang;
      languageNote.textContent = ui("messageLanguageNote", { language: ui(languageNameKey(hostLang)) });
      const viberNote = byId("viber-note");
      viberNote.hidden = !phones.viber;
      viberNote.textContent = ui("viberNote");
    }

    function copyWithSelectionFallback() {
      const textarea = byId("result-message");
      textarea.select();
      return document.execCommand && document.execCommand("copy");
    }

    function copyMessage(successText) {
      const status = byId("copy-status");
      const message = byId("result-message").value;
      const clipboardWrite = root.navigator.clipboard && root.isSecureContext
        ? root.navigator.clipboard.writeText(message)
        : Promise.reject(new Error("Clipboard API unavailable"));
      clipboardWrite
        .then(() => { status.textContent = successText; })
        .catch(() => { status.textContent = copyWithSelectionFallback() ? successText : ui("copyFailed"); });
    }

    function showInquiryResult(values) {
      const lines = buildInquiryText(values);
      byId("result-message").value = lines.join("\n");
      byId("copy-status").textContent = "";
      renderResultNotes();
      renderSendButtons(lines, values);
      byId("inquiry-form").hidden = true;
      byId("inquiry-result").hidden = false;
      byId("result-title").focus();
    }

    function handleInquirySubmit(event) {
      event.preventDefault();
      const values = readInquiryValues();
      const unit = selectedUnit(values.unitIndex);
      const errors = validateInquiry(values, {
        today: toIsoDate(new Date()),
        maxGuests: maxGuests(),
        minNights: (site.rules && site.rules.minNights) || 1,
        unitCapacity: unit ? unit.capacity : undefined,
      });
      showFieldErrors(errors, unit);
      const invalidFields = Object.keys(errors);
      byId("form-status").textContent = invalidFields.length ? ui("errorSummary") : "";
      if (invalidFields.length) {
        inquiryFields()[invalidFields[0]].focus();
        return;
      }
      showInquiryResult(values);
    }

    function resetInquiryResult() {
      byId("inquiry-result").hidden = true;
      byId("inquiry-form").hidden = false;
    }

    function openInquiry(options) {
      const settings = options || {};
      resetInquiryResult();
      if (settings.unitIndex !== undefined) byId("field-unit").value = String(settings.unitIndex);
      const behavior = root.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      byId("inquiry").scrollIntoView({ behavior, block: "start" });
      byId("field-from").focus({ preventScroll: true });
    }

    function setupInquiry() {
      byId("inquiry-form").addEventListener("submit", handleInquirySubmit);
      byId("field-from").addEventListener("change", syncDateLimits);
      byId("edit-inquiry").addEventListener("click", () => {
        resetInquiryResult();
        byId("field-from").focus();
      });
      document.addEventListener("click", (event) => {
        const link = event.target.closest('a[href="#inquiry"]');
        if (!link) return;
        event.preventDefault();
        closeMenu();
        openInquiry();
      });
      syncDateLimits();
    }

    function messageChannelNames() {
      return [phones.viber && "Viber", phones.whatsapp && "WhatsApp", contact.email && ui("channelEmail")].filter(Boolean);
    }

    function formatChannelList(channels) {
      try {
        return new Intl.ListFormat(locale(), { type: "disjunction" }).format(channels);
      } catch (error) {
        return channels.join(", ");
      }
    }

    function renderInquiry() {
      const channels = messageChannelNames();
      byId("inquiry-lead").hidden = channels.length === 0;
      document.querySelector(".inquiry__card").hidden = channels.length === 0;
      if (channels.length) byId("inquiry-lead").textContent = ui("inquiryIntro", { channels: formatChannelList(channels) });
      renderGuestOptions();
      renderUnitOptions();
      renderDirectContacts();
      showFieldErrors({});
      byId("form-status").textContent = "";
      resetInquiryResult();
    }

    /* ---------- footer & mobile bar ---------- */

    function renderFooter() {
      const name = text(site.property.name);
      byId("footer-name").textContent = name;
      byId("footer-address").textContent = addressLines().join(", ");
      const contacts = [];
      if (phones.phone) contacts.push(contactItem(h("a", { href: buildTelUrl(phones.phone), text: phoneLabel() })));
      if (contact.email) contacts.push(contactItem(h("a", { href: buildMailtoUrl(contact.email), text: contact.email })));
      byId("footer-contacts").replaceChildren(...contacts);

      const socials = (site.socials || []).filter((social) => isSafeLink(social.url));
      byId("footer-social").replaceChildren(...socials.map((social) =>
        contactItem(externalLink(social.url, social.label || SOCIAL_LABELS[social.type] || social.type))));
      byId("footer-social-block").hidden = socials.length === 0;

      byId("footer-copyright").textContent = "© " + new Date().getFullYear() + " " + name + ". " + ui("rightsReserved");
      renderCredit();
    }

    function renderCredit() {
      const credit = site.credit || {};
      const holder = byId("footer-credit");
      holder.hidden = !credit.show;
      if (!credit.show) return;
      const label = text(credit.label);
      holder.replaceChildren(isSafeLink(credit.url) ? externalLink(credit.url, label) : label);
    }

    function renderMobileBar() {
      const call = byId("mobile-call");
      call.hidden = !phones.phone;
      if (phones.phone) call.href = buildTelUrl(phones.phone);
      document.body.classList.add("has-mobile-bar");
    }

    /* ---------- mobile menu (static "Menu" label; aria-expanded carries the state) ---------- */

    function setMenuOpen(isOpen) {
      byId("menu-toggle").setAttribute("aria-expanded", String(isOpen));
      byId("site-header").classList.toggle("is-menu-open", isOpen);
    }

    function closeMenu() {
      setMenuOpen(false);
    }

    function setupMenu() {
      const toggle = byId("menu-toggle");
      toggle.addEventListener("click", () => setMenuOpen(toggle.getAttribute("aria-expanded") !== "true"));
      byId("primary-nav").addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
        closeMenu();
        toggle.focus();
      });
    }

    /* ---------- SEO ---------- */

    function upsertHeadElement(selector, tag, attributes) {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement(tag);
        document.head.append(element);
      }
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
      return element;
    }

    function setMeta(attribute, key, content) {
      if (!content) return;
      upsertHeadElement("meta[" + attribute + '="' + key + '"]', "meta", { [attribute]: key, content });
    }

    function updateSeo() {
      const seo = site.seo || {};
      const title = text(seo.title) || text(site.property.name);
      const description = text(seo.description);
      document.documentElement.lang = state.lang;
      document.title = title;
      setMeta("name", "description", description);
      setMeta("property", "og:type", "website");
      setMeta("property", "og:title", title);
      setMeta("property", "og:description", description);
      setMeta("property", "og:site_name", text(site.property.name));
      setMeta("property", "og:locale", locale().replace("-", "_"));
      setMeta("property", "og:image", absoluteUrl(site, seo.image));
      setMeta("property", "og:url", pageUrlFor(site, state.lang));
      setMeta("name", "twitter:card", "summary_large_image");
      if (site.demo) setMeta("name", "robots", "noindex");
      if (site.siteUrl) {
        upsertHeadElement('link[rel="canonical"]', "link", { rel: "canonical", href: pageUrlFor(site, state.lang) });
        languages.forEach((language) => upsertHeadElement('link[rel="alternate"][hreflang="' + language.code + '"]', "link",
          { rel: "alternate", hreflang: language.code, href: pageUrlFor(site, language.code) }));
      }
      upsertHeadElement('script[type="application/ld+json"]', "script", { type: "application/ld+json" })
        .textContent = JSON.stringify(buildStructuredData(site, state.lang));
    }

    /* ---------- orchestration ---------- */

    function renderAll() {
      applyUiStrings();
      markActiveLanguage();
      const sections = [
        ["", renderBrand], ["", renderDemoRibbon], ["top", renderHero], ["about", renderAbout],
        ["rooms", renderUnits], ["gallery", renderGallery], ["amenities", renderAmenities],
        ["rules", renderRules], ["location", renderLocation], ["reviews", renderReviews],
        ["inquiry", renderInquiry], ["", renderFooter], ["", renderMobileBar], ["", updateSeo],
      ];
      sections.forEach(([sectionId, render]) => safeRender(sectionId, render));
    }

    function switchLanguage(lang) {
      if (!supportedCodes.includes(lang) || lang === state.lang) return;
      closeMenu();
      state.lang = lang;
      storeLang(lang);
      writeLangToUrl(lang);
      renderAll();
    }

    function warnAboutConfig() {
      if (!site.property || !site.property.name) console.warn("config.js: property.name is missing.");
      ["phone", "viber", "whatsapp"].forEach((field) => {
        if (contact[field] && !phones[field]) {
          console.warn("config.js: contact." + field + " is not a usable phone number; use +359 888 123 456 or 0888 123 456.");
        }
      });
      if (!hasCoordinates(site)) console.warn("config.js: geo.lat / geo.lon missing, the map is hidden.");
      if (!(site.booking && site.booking.maxGuests)) console.warn("config.js: booking.maxGuests is missing (defaults to 1).");
      if (!phones.viber && !phones.whatsapp && !contact.email) {
        console.warn("config.js: add contact.viber, contact.whatsapp or contact.email, otherwise the inquiry form is hidden.");
      }
    }

    site.property = site.property || {};
    warnAboutConfig();
    state.lang = initialLang();
    if (site.theme) {
      applyThemeColors(site.theme);
      applyThemeFonts(site.theme);
    }
    renderLanguageSwitch();
    setupMenu();
    setupLightbox();
    setupInquiry();
    renderAll();
  }

  function showMissingConfigError() {
    const main = document.getElementById("main");
    const message = document.createElement("p");
    message.className = "noscript-note";
    message.textContent = "config.js is missing or invalid (window.SITE is not defined).";
    if (main) main.prepend(message);
  }

  const publicApi = {
    localize, fillTemplate, isSafeLink, normalizePhone, toPhoneDigits, buildTelUrl, buildViberUrl, buildWhatsAppUrl,
    buildMailtoUrl, buildOsmEmbedUrl, buildGoogleMapsUrl, toIsoDate, addDaysIso, countNights,
    validateInquiry, composeInquiryLines, resolveInitialLang, absoluteUrl, pageUrlFor, buildStructuredData, buildSrcset,
  };

  if (typeof module === "object" && module.exports) module.exports = publicApi;

  if (typeof document !== "undefined") {
    const boot = () => (root.SITE && typeof root.SITE === "object" ? startApp(root.SITE) : showMissingConfigError());
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
