"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { links } from "@/lib/links";

/**
 * Site-wide Join pop-up: every "Join" CTA (any link whose href is links.join)
 * opens the GiverArmyFund campaign's hosted donate widget in a modal instead
 * of navigating. Without JavaScript the links still work — they go to /join,
 * which serves the same widget as a full page.
 *
 * COMPLIANCE: the widget is hosted on the GiveSendGo platform, but gifts are
 * made to GiveSendGo Charities, Inc. (501(c)(3), EIN 88-3776392) — the
 * disclosure line below the frame states this and must not be removed.
 */
const WIDGET_SRC =
  "https://www.givesendgo.com/GiverArmyFund/donate/widget?primary=%23b38e3d&frequency=monthly";

function trackEvent(event: string) {
  try {
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    (w.dataLayer = w.dataLayer || []).push({ event });
  } catch {
    /* analytics must never break the widget */
  }
}

export function JoinWidget() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Event delegation: intercept plain left-clicks on any Join link so every
  // CTA pops the widget without converting each one to a client component.
  // Capture phase so this wins over next/link's own click handler; modified
  // clicks (new tab, etc.) fall through to the /join page.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href !== links.join) return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
      trackEvent("join_widget_open");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // ESC to close + scroll lock + focus the close button while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Join the Giver Army"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 cursor-default bg-slate-deep/70 backdrop-blur-sm"
      />
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[480px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-base/10 px-5 py-3">
          <p className="text-sm font-bold text-slate-base">
            Enlist in the Giver Army
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-base/70 transition hover:bg-slate-base/10 hover:text-slate-base"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <iframe
            src={WIDGET_SRC}
            width="100%"
            height="700"
            style={{ border: 0, display: "block", width: "100%" }}
            title="Donate via GiveSendGo"
            allow="payment *"
          />
          <p className="px-5 pb-4 pt-2 text-xs leading-relaxed text-slate-base/70">
            Gifts through this form are processed on the GiveSendGo platform
            campaign and are made to GiveSendGo Charities, Inc., a 501(c)(3)
            public charity (EIN 88-3776392).
          </p>
        </div>
      </div>
    </div>
  );
}
