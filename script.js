const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
  revealObserver.observe(element);
});

const strips = document.querySelectorAll(".hero-strip img");

function updateStripParallax() {
  const scrollY = window.scrollY;
  strips.forEach((strip, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    const speed = 0.035 + index * 0.004;
    strip.style.setProperty("--strip-offset", `${scrollY * speed * direction}px`);
  });
}

window.addEventListener("scroll", updateStripParallax, { passive: true });
updateStripParallax();

const cards = [...document.querySelectorAll(".experience-card")];
const dotsContainer = document.querySelector(".carousel-dots");
const prevButton = document.querySelector(".carousel-arrow.prev");
const nextButton = document.querySelector(".carousel-arrow.next");
let activeCard = 0;
let carouselTimer;

cards.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Ver experiencia ${index + 1}`);
  dot.addEventListener("click", () => showCard(index, true));
  dotsContainer?.appendChild(dot);
});

const dots = [...document.querySelectorAll(".carousel-dots button")];

function showCard(index, userAction = false) {
  if (!cards.length) return;
  activeCard = (index + cards.length) % cards.length;
  cards.forEach((card, cardIndex) => {
    const isActive = cardIndex === activeCard;
    const video = card.querySelector("video");
    card.classList.toggle("is-active", isActive);

    if (video && !isActive) {
      video.pause();
    }
  });
  dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === activeCard));

  if (userAction) {
    restartCarousel();
  }
}

function restartCarousel() {
  if (!cards.length) return;
  window.clearInterval(carouselTimer);
  carouselTimer = window.setInterval(() => showCard(activeCard + 1), 5200);
}

if (cards.length) {
  prevButton?.addEventListener("click", () => showCard(activeCard - 1, true));
  nextButton?.addEventListener("click", () => showCard(activeCard + 1, true));
  showCard(0);
  restartCarousel();
}

const canvas = document.querySelector("#particle-canvas");
const ctx = canvas?.getContext("2d");
const particles = [];
const mouse = { x: 0.5, y: 0.5 };
let particleAnimation;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
}

function createParticles() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const count = Math.min(120, Math.max(54, Math.floor((rect.width * rect.height) / 15000)));
  particles.length = 0;

  for (let i = 0; i < count; i += 1) {
    const depth = Math.random();
    particles.push({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      depth,
      size: 0.7 + depth * 2.2,
      speedX: (Math.random() - 0.5) * (0.08 + depth * 0.18),
      speedY: -0.05 - depth * 0.16,
      opacity: 0.16 + depth * 0.32,
    });
  }
}

function drawParticles() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  particles.forEach((particle) => {
    const pullX = (mouse.x - 0.5) * particle.depth * 18;
    const pullY = (mouse.y - 0.5) * particle.depth * 18;
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.y < -12) particle.y = rect.height + 12;
    if (particle.x < -12) particle.x = rect.width + 12;
    if (particle.x > rect.width + 12) particle.x = -12;

    ctx.beginPath();
    ctx.arc(particle.x + pullX, particle.y + pullY, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${particle.opacity})`;
    ctx.fill();
  });

  particleAnimation = window.requestAnimationFrame(drawParticles);
}

document.addEventListener(
  "mousemove",
  (event) => {
    mouse.x = event.clientX / window.innerWidth;
    mouse.y = event.clientY / window.innerHeight;
  },
  { passive: true }
);

function drawStaticParticles() {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${particle.opacity * 0.7})`;
    ctx.fill();
  });
}

window.addEventListener("resize", () => {
  resizeCanvas();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    drawStaticParticles();
  }
});

if (canvas && ctx) {
  resizeCanvas();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    drawStaticParticles();
  } else {
    drawParticles();
  }
}

window.addEventListener("beforeunload", () => {
  window.cancelAnimationFrame(particleAnimation);
});
