// ===============================
// EmailJS CONFIG (mets tes vrais IDs)
// ===============================
const EMAILJS_PUBLIC_KEY = "uSAFy3wBFaQMmrgss";
const EMAILJS_SERVICE_ID = "service_nb0oh24";     // ✅ doit commencer par service_
const EMAILJS_TEMPLATE_ID = "template_umomg9h";   // ✅ doit commencer par template_

// ===============================
// Site config
// ===============================
// WhatsApp sans + ni espaces
const WHATSAPP_PHONE = "212708304653";
// Email agence (pour mailto uniquement)
const AGENCY_EMAIL = "nexora.studio.26@gmail.com";
const AGENCY_NAME = "Nexora Studio";

const $ = (q) => document.querySelector(q);

// ===============================
// Toast
// ===============================
const toast = (msg) => {
  const el = $("#toast");
  if (!el) return alert(msg);
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (el.hidden = true), 2400);
};

// ===============================
// Theme toggle (persist)
// ===============================
const initTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
};
const toggleTheme = () => {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  toast(next === "light" ? "Thème clair" : "Thème sombre");
};

// ===============================
// Reveal on scroll
// ===============================
const initReveal = () => {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
};

// ===============================
// Progress bar
// ===============================
const initProgress = () => {
  const bar = $("#progress");
  if (!bar) return;

  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = `${pct}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
};

// ===============================
// Mobile menu
// ===============================
const initMobileMenu = () => {
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  if (!burger || !menu) return;

  const close = () => {
    menu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    burger.setAttribute("aria-expanded", String(willOpen));
  });

  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
};

// ===============================
// WhatsApp + mailto
// ===============================
const buildMessage = (data) => {
  const lines = [
    `Bonjour ${AGENCY_NAME},`,
    `Je souhaite un devis pour un site web.`,
    ``,
    `Nom: ${data.name || "-"}`,
    `Téléphone: ${data.phone || "-"}`,
    `Email: ${data.email || "-"}`,
    `Budget: ${data.budget || "-"}`,
    `Localisation: ${data.location || "-"}`,
    `Réseaux sociaux: ${data.social || "-"}`,
    ``,
    `Besoin:`,
    `${data.message || "-"}`,
  ];
  return lines.join("\n");
};


const initContactLinks = () => {
  const wa = $("#waLink");
  const em = $("#emailLink");
  if (!wa || !em) return;

  const defaultBody = buildMessage({
    name: "",
    phone: "",
    email: "",
    budget: "",
    message: "Je veux créer un site web professionnel. Pouvez-vous me proposer un devis ?",
  });

  wa.href = waUrl(defaultBody);
  em.href = mailtoUrl(`Demande de devis — ${AGENCY_NAME}`, defaultBody);
};

// ===============================
// EmailJS init safe
// ===============================
const initEmailJS = () => {
  if (!window.emailjs) {
    console.warn("EmailJS not loaded. Add CDN script before app.js.");
    return false;
  }
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  return true;
};

// ===============================
// Form handling (EmailJS + WhatsApp)
// ===============================
const initLeadForm = () => {
  const form = $("#leadForm");
  const btnWA = $("#sendViaWA");
  if (!form) return;

  const emailjsReady = initEmailJS();

  // Read form (supporte message OU need)
  const readForm = () => {
    const fd = new FormData(form);

    return {
      name: (fd.get("name") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      budget: (fd.get("budget") || "").toString().trim(),
      message: msg, // ton besoin
      location: (fd.get("location") || "").toString().trim(),
      social: (fd.get("social") || "").toString().trim(),
    };
  };

  // ✅ SEND EMAIL via EmailJS
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = readForm();
    console.log("FORM DATA:", data);

    // Obligatoires
    if (!data.name || !data.email || !data.budget || !data.message) {
      toast("Merci de remplir les champs obligatoires.");
      return;
    }

    if (!emailjsReady) {
      toast("EmailJS n'est pas chargé (script CDN manquant).");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const old = btn?.textContent || "Envoyer la demande";

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Envoi...";
      }

      // IMPORTANT:
      // Ton template EmailJS utilise {{message}} ?
      // Alors ton formulaire doit envoyer un champ "message"
      // -> On crée un input caché si tu utilises "need"


      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);

      form.reset();
      toast("Demande envoyée ✅ On te répond vite.");
    } catch (err) {
      console.error("EmailJS error:", err);
      toast("Erreur d'envoi. Vérifie SERVICE/TEMPLATE IDs ou essaye WhatsApp.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = old;
      }
    }
  });

  // WhatsApp button
  btnWA?.addEventListener("click", () => {
    const data = readForm();
    if (!data.name || !data.email || !data.budget || !data.message) {
      toast("Remplis au moins Nom, Email, Budget et Besoin.");
      return;
    }
    window.open(waUrl(buildMessage(data)), "_blank", "noreferrer");
    toast("Ouverture de WhatsApp…");
  });
};

// ===============================
// KPI animation
// ===============================
const initKpis = () => {
  const conv = $("#kpiConv");
  const load = $("#kpiLoad");
  const traffic = $("#kpiTraffic");
  if (!conv || !load || !traffic) return;

  const values = [
    { el: conv, arr: ["2.6%", "3.1%", "3.4%", "3.8%"] },
    { el: load, arr: ["1.6s", "1.3s", "1.1s", "0.9s"] },
    { el: traffic, arr: ["+12%", "+18%", "+28%", "+35%"] },
  ];

  let i = 0;
  setInterval(() => {
    i = (i + 1) % 4;
    values.forEach((v) => (v.el.textContent = v.arr[i]));
  }, 2200);
};

// ===============================
// Modal
// ===============================
const PROJECTS = {
  landing: {
    tag: "Site Vitrine",
    title: "Cabinet - Dr.Sarah",
    desc: "Structure conversion, témoignages, CTA, formulaire.",
    cover: "assets/portfolio/portfolio-cabinet.png",
    demoUrl: "https://ahmed-outmaghoust.github.io/Project-SVT-_LALLA-NEZHA/",
    bullets: [
      "Hero + CTA optimisés conversion",
      "Sections preuve sociale",
      "Formulaire lead ",
      "Performance & SEO basics",
    ],
  },
  shop: {
    tag: "Site Vitrine",
    title: "GYM — Coaching",
    desc: "Pages produit clean, bundles, upsell, SEO.",
    cover: "assets/portfolio/portfolio-gym.png",
    demoUrl: "https://ton-lien-demo-shop.com",
    bullets: [
      "Page optimisées",
      "Plan d'abonnement",
      "Collections et heures de travail",
      "SEO + vitesse",
    ],
  },
  vitrine: {
    tag: "Site",
    title: "Barber Shop",
    desc: "Preuves sociales, FAQ, prise de RDV.",
    cover: "assets/portfolio/vitrine-cabinet.png",
    demoUrl: "https://ton-lien-demo-vitrine.com",
    bullets: [
      "Structure claire",
      "Section services + Galerie",
      "RDV / contact",
      "SEO local",
    ],
  },
};

const initModal = () => {
  const modal = document.querySelector("#modal");
  const close = document.querySelector("#closeModal");
  const modalTitle = document.querySelector("#modalTitle");
  const modalBody = document.querySelector("#modalBody");
  const modalDemo = document.querySelector("#modalDemo");

  if (!modal || !close || !modalTitle || !modalBody || !modalDemo) return;

  const openProject = (key) => {
    const p = PROJECTS[key];
    if (!p) return;

    modalTitle.textContent = p.title;

    modalBody.innerHTML = `
      <div style="display:grid; gap:12px;">
        <img src="${p.cover}" alt="${p.title}" style="width:100%; border-radius:16px; border:1px solid var(--line);">
        <p class="muted" style="margin:0;">${p.desc}</p>
        <ul class="modal__list">
          ${p.bullets.map((b) => `<li>${b}</li>`).join("")}
        </ul>
      </div>
    `;

    modalDemo.href = p.demoUrl;
    modal.showModal();
  };

  // click "Voir le détail →"
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (!btn) return;
    const key = btn.getAttribute("data-open");
    openProject(key);
  });

  close.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const inDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.bottom &&
      rect.left <= e.clientX &&
      e.clientX <= rect.right;
    if (!inDialog) modal.close();
  });
};

// ===============================
// Year + link toasts
// ===============================
const initYear = () => {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
};

const initToastsOnLinks = () => {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-toast]");
    if (btn) toast(btn.getAttribute("data-toast"));
  });
};

// ===============================
// Boot
// ===============================
initTheme();
$("#themeToggle")?.addEventListener("click", toggleTheme);

initReveal();
initProgress();
initMobileMenu();
initContactLinks();
initLeadForm();
initKpis();
initModal();
initYear();
initToastsOnLinks();