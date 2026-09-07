const heroOpener = document.getElementById("heroOpener");
const nav = document.querySelector(".nav");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (heroOpener) {
  document.body.classList.add("intro-active");

  const revealHeroCopy = () => {
    heroOpener.classList.add("is-tagline");
    document
      .querySelectorAll(".hero-lead.reveal")
      .forEach((el) => el.classList.add("visible"));
  };

  const showFinal = () => {
    heroOpener.classList.add("is-enter", "is-rise", "is-tagline");
    document.body.classList.remove("intro-active");
    document.body.classList.add("hero-ready");
    nav?.classList.remove("nav-hidden");
    document
      .querySelectorAll(".hero-lead.reveal")
      .forEach((el) => el.classList.add("visible"));
  };

  if (reducedMotion) {
    showFinal();
  } else {
    // 1) Welcome to Delphin appears centered
    setTimeout(() => {
      heroOpener.classList.add("is-enter");
    }, 120);

    // 2) Rises into its final hero position
    setTimeout(() => {
      heroOpener.classList.add("is-rise");
      document.body.classList.add("hero-settling");
    }, 1450);

    // 3) Tagline + hero supporting copy
    setTimeout(() => {
      revealHeroCopy();
      nav?.classList.remove("nav-hidden");
    }, 2350);

    // 4) Unlock page; rest of site eases in
    setTimeout(showFinal, 3000);
  }
} else {
  document.body.classList.add("hero-ready");
  nav?.classList.remove("nav-hidden");
  if (document.body.classList.contains("page-sub")) {
    nav?.classList.add("nav-solid");
  }
  document
    .querySelectorAll(".hero-lead.reveal")
    .forEach((el) => el.classList.add("visible"));
}

document.querySelectorAll("[data-page-back]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const ref = document.referrer;
    if (!ref || history.length < 2) return;
    try {
      if (new URL(ref).origin === location.origin) {
        event.preventDefault();
        history.back();
      }
    } catch (_) {
      /* keep fallback href */
    }
  });
});

const hero = document.querySelector(".hero");
const menu = document.querySelector(".menu");
const navPanel = document.getElementById("navPanel");
const navOverlay = document.getElementById("navOverlay");

const closeMenu = () => {
  nav?.classList.remove("is-menu-open");
  document.body.classList.remove("nav-menu-open");
  menu?.setAttribute("aria-expanded", "false");
  menu?.setAttribute("aria-label", "Open menu");
  navOverlay?.setAttribute("aria-hidden", "true");
};

const openMenu = () => {
  nav?.classList.add("is-menu-open");
  document.body.classList.add("nav-menu-open");
  menu?.setAttribute("aria-expanded", "true");
  menu?.setAttribute("aria-label", "Close menu");
  navOverlay?.setAttribute("aria-hidden", "false");
};

const syncNav = () => {
  if (nav && hero)
    nav.classList.toggle("nav-solid", scrollY > window.innerHeight * 0.6);
};

window.addEventListener(
  "scroll",
  () => {
    if (nav?.classList.contains("is-menu-open")) closeMenu();
    syncNav();
  },
  { passive: true },
);
syncNav();

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    }),
  { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

menu?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (nav?.classList.contains("is-menu-open")) closeMenu();
  else openMenu();
});

navOverlay?.addEventListener("click", (e) => {
  if (e.target === navOverlay) closeMenu();
});

navPanel?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", () => {
    closeMenu();
  }),
);

document.querySelectorAll(".work-card").forEach((card) => {
  const visual = card.querySelector(".demo-window");
  if (!visual) return;
  card.addEventListener("mousemove", (e) => {
    if (innerWidth < 900) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    visual.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
  });
  card.addEventListener("mouseleave", () => (visual.style.transform = ""));
});

const contactForm = document.getElementById("contactForm");
const contactFormWrap = document.getElementById("contactFormWrap");
const contactSuccess = document.getElementById("contactSuccess");
const contactNote = document.getElementById("contactFormNote");
const contactSubmitBtn = document.getElementById("contactSubmitBtn");

function setContactLoading(isLoading) {
  if (!contactSubmitBtn) return;
  contactSubmitBtn.disabled = isLoading;
  contactSubmitBtn.classList.toggle("is-loading", isLoading);
  contactSubmitBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
}

function showContactError(message) {
  if (!contactNote) return;
  contactNote.hidden = false;
  contactNote.textContent = message;
  contactNote.classList.add("is-visible");
}

function showContactSuccess() {
  if (!contactForm || !contactSuccess || !contactFormWrap) return;
  contactForm.setAttribute("aria-hidden", "true");
  contactForm.classList.add("is-sent");
  contactSuccess.hidden = false;
  contactFormWrap.classList.add("is-success");
  // Retrigger CSS animation
  contactSuccess.classList.remove("is-animate");
  void contactSuccess.offsetWidth;
  contactSuccess.classList.add("is-animate");
  contactSuccess.focus?.();
}

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (contactNote) {
    contactNote.hidden = true;
    contactNote.textContent = "";
    contactNote.classList.remove("is-visible");
  }

  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    company: String(data.get("company") || "").trim(),
    message: String(data.get("message") || "").trim(),
    company_website: String(data.get("company_website") || "").trim(),
  };

  setContactLoading(true);

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || "Unable to send your message. Please try again.",
      );
    }

    form.reset();
    showContactSuccess();
  } catch (err) {
    showContactError(
      err?.message ||
        "Unable to send your message. Please email admin@delphin.in directly.",
    );
  } finally {
    setContactLoading(false);
  }
});
