// @license http://www.gnu.org/licenses/agpl-3.0.html AGPL-3.0
// SPDX-License-Identifier: AGPL-3.0-only
//
// Rewrites server-rendered UTC timestamps into the visitor's local time.
//
// Nitter renders every timestamp in UTC and tags the element with:
//   data-utc        ISO 8601 instant, e.g. "2026-03-05T13:23:45Z"
//   data-utc-text   format to use for the element's text  (optional)
//   data-utc-title  format to use for the title attribute (optional)
//
// Nothing here talks to the server, so pages stay cacheable and identical
// for every visitor.
(function () {
    "use strict";

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const MONTHS_FULL = ["January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December"];

    function pad(n) {
        return (n < 10 ? "0" : "") + n;
    }

    // "UTC+09:00", extending the plain "UTC" suffix the server writes.
    function tzLabel(date) {
        const offset = -date.getTimezoneOffset();
        if (offset === 0) return "UTC";
        const abs = Math.abs(offset);
        return "UTC" + (offset < 0 ? "-" : "+") + pad(Math.floor(abs / 60)) + ":" + pad(abs % 60);
    }

    function clockTime(date) {
        const hours = date.getHours();
        return (hours % 12 || 12) + ":" + pad(date.getMinutes()) +
               " " + (hours < 12 ? "AM" : "PM");
    }

    // Mirrors getTime in src/formatters.nim.
    function fullTime(date) {
        return MONTHS[date.getMonth()] + " " + date.getDate() + ", " +
               date.getFullYear() + " · " + clockTime(date) + " " + tzLabel(date);
    }

    // Mirrors getShortTime in src/formatters.nim. The relative branches are
    // timezone independent, the absolute ones are not, so recompute all of them.
    function shortTime(date) {
        const now = new Date();
        const since = (now - date) / 1000;

        if (now.getFullYear() !== date.getFullYear())
            return date.getDate() + " " + MONTHS[date.getMonth()] + " " + date.getFullYear();
        if (since >= 86400)
            return MONTHS[date.getMonth()] + " " + date.getDate();
        if (since >= 3600)
            return Math.floor(since / 3600) + "h";
        if (since >= 60)
            return Math.floor(since / 60) + "m";
        if (since > 1)
            return Math.floor(since) + "s";
        return "now";
    }

    // Mirrors getJoinDate / getJoinDateFull in src/formatters.nim.
    function joinedTime(date) {
        return "Joined " + MONTHS_FULL[date.getMonth()] + " " + date.getFullYear();
    }

    function joinedFullTime(date) {
        return clockTime(date) + " - " + date.getDate() + " " +
               MONTHS[date.getMonth()] + " " + date.getFullYear();
    }

    const FORMATS = {
        "short": shortTime,
        "full": fullTime,
        "joined": joinedTime,
        "joined-full": joinedFullTime
    };

    // Replaces the element's own timestamp text without disturbing sibling
    // nodes such as the calendar icon in front of the join date.
    function setText(el, value) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        let last = null, node;
        while ((node = walker.nextNode()))
            if (node.nodeValue.trim().length > 0) last = node;

        if (last === null) {
            el.textContent = value;
        } else {
            last.nodeValue = last.nodeValue.match(/^\s*/)[0] + value;
        }
    }

    function localize(el) {
        const date = new Date(el.getAttribute("data-utc"));
        if (isNaN(date.getTime())) return;

        const text = FORMATS[el.getAttribute("data-utc-text")];
        if (text) setText(el, text(date));

        const title = FORMATS[el.getAttribute("data-utc-title")];
        if (title) el.setAttribute("title", title(date));
    }

    function localizeAll(root) {
        (root || document).querySelectorAll("[data-utc]").forEach(localize);
    }

    localizeAll(document);

    // Infinite scrolling and the "load more" replies append tweets after load.
    if (typeof MutationObserver !== "undefined") {
        new MutationObserver(function (mutations) {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    if (node.hasAttribute("data-utc")) localize(node);
                    localizeAll(node);
                }
            }
        }).observe(document.body, {childList: true, subtree: true});
    }
})();
// @license-end
