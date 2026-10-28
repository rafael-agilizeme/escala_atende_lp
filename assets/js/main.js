/**
 * Escala Atende - Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation & Scroll to Top Button
  const stickyHeader = document.querySelector('[data-hb="sticky"]');
  const scrollTopBtn = document.querySelector('.scroll-top-btn');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateScrollUi = () => {
    const scrollY = window.scrollY;
    const showSticky = scrollY > 480;
    const showScrollTop = scrollY > 640;

    if (stickyHeader) {
      stickyHeader.style.transform = showSticky ? 'translateY(0)' : 'translateY(-100%)';
      stickyHeader.style.opacity = showSticky ? '1' : '0';
      stickyHeader.style.pointerEvents = showSticky ? 'auto' : 'none';
      stickyHeader.setAttribute('aria-hidden', showSticky ? 'false' : 'true');
    }

    if (scrollTopBtn) {
      scrollTopBtn.style.opacity = showScrollTop ? '1' : '0';
      scrollTopBtn.style.transform = showScrollTop ? 'translateY(0)' : 'translateY(12px)';
      scrollTopBtn.style.pointerEvents = showScrollTop ? 'auto' : 'none';
    }
  };

  window.addEventListener('scroll', updateScrollUi, { passive: true });
  updateScrollUi();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // 2. Mobile Menu Handlers
  const closeAllMenus = () => {
    document.querySelectorAll('details[data-hb="mobile-nav"][open]').forEach((el) => {
      el.removeAttribute('open');
    });
  };

  document.addEventListener('click', (e) => {
    // If clicked anchor inside nav, close mobile menu
    if (e.target.closest('a[href^="#"]')) {
      closeAllMenus();
    }
    // Close mobile menu if clicked outside
    if (!e.target.closest('details[data-hb="mobile-nav"]')) {
      document.querySelectorAll('details[data-hb="mobile-nav"][open]').forEach((el) => el.removeAttribute('open'));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllMenus();
    }
  });

  // 3. Interactive FAQ Accordion (one open at a time)
  const faqItems = document.querySelectorAll('#faq details');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item && other.open) {
          other.removeAttribute('open');
        }
      });
    });
  });

  // 4. Interactive Product Gallery
  const gallery = document.querySelector('[data-product-gallery]');
  if (gallery) {
    const shots = [...gallery.querySelectorAll('[data-product-shot]')];
    const categories = [...gallery.querySelectorAll('[data-product-category]')];
    const mainImage = gallery.querySelector('[data-product-main]');
    const windowLabel = gallery.querySelector('[data-product-window-label]');
    const currentCounter = gallery.querySelector('[data-product-current]');
    const kicker = gallery.querySelector('[data-product-kicker]');
    const title = gallery.querySelector('[data-product-title]');
    const copy = gallery.querySelector('[data-product-copy]');
    const progress = gallery.querySelector('[data-hb="product-progress"]');
    const prevBtn = gallery.querySelector('[data-product-prev]');
    const nextBtn = gallery.querySelector('[data-product-next]');

    let activeIndex = 0;
    let timer = null;
    let isVisible = false;
    let isPaused = false;

    const stopRotation = () => {
      if (timer) window.clearTimeout(timer);
      gallery.classList.remove('is-rotating');
    };

    const startRotation = () => {
      stopRotation();
      if (reduceMotion || !isVisible || isPaused) return;
      if (progress) void progress.offsetWidth; // restart css animation
      gallery.classList.add('is-rotating');
      timer = window.setTimeout(() => showShot(activeIndex + 1), 7000);
    };

    const showShot = (requestedIndex, shouldScroll = false) => {
      activeIndex = (requestedIndex + shots.length) % shots.length;
      const shot = shots[activeIndex];

      if (mainImage) {
        mainImage.classList.remove('is-entering');
        mainImage.src = shot.dataset.src;
        mainImage.alt = shot.dataset.alt || 'Tela do Escala Atende';
        void mainImage.offsetWidth;
        if (!reduceMotion) mainImage.classList.add('is-entering');
      }

      if (windowLabel) windowLabel.textContent = shot.dataset.window || 'Escala Atende';
      if (currentCounter) currentCounter.textContent = String(activeIndex + 1).padStart(2, '0');
      if (kicker) kicker.textContent = shot.dataset.kicker || 'Recurso';
      if (title) title.textContent = shot.dataset.title || '';
      if (copy) copy.textContent = shot.dataset.copy || '';

      shots.forEach((item, idx) => {
        item.setAttribute('aria-selected', String(idx === activeIndex));
      });

      const currentCategory = shot.dataset.category;
      categories.forEach((cat) => {
        cat.setAttribute('aria-selected', String(cat.dataset.productCategory === currentCategory));
      });

      if (shouldScroll) {
        shot.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      }

      startRotation();
    };

    shots.forEach((shot, idx) => {
      shot.addEventListener('click', () => showShot(idx, true));
    });

    categories.forEach((cat) => {
      cat.addEventListener('click', () => {
        const targetIdx = Number(cat.dataset.productTarget || 0);
        showShot(targetIdx, true);
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => showShot(activeIndex - 1, true));
    if (nextBtn) nextBtn.addEventListener('click', () => showShot(activeIndex + 1, true));

    gallery.addEventListener('pointerenter', () => {
      isPaused = true;
      gallery.classList.add('is-paused');
      stopRotation();
    });

    gallery.addEventListener('pointerleave', () => {
      isPaused = false;
      gallery.classList.remove('is-paused');
      startRotation();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting && entry.intersectionRatio > 0.2;
        if (isVisible) startRotation();
        else stopRotation();
      }, { threshold: [0, 0.2, 0.5] });
      observer.observe(gallery);
    } else {
      isVisible = true;
      startRotation();
    }
  }

  // 5. Onboarding Model Comparison Selector
  const onboardingContainer = document.querySelector('[data-onboarding-models]');
  if (onboardingContainer) {
    const choices = [...onboardingContainer.querySelectorAll('[data-onboarding-choice]')];
    const planCells = [...onboardingContainer.querySelectorAll('th[data-plan], td[data-plan]')];
    const selectionText = onboardingContainer.querySelector('[data-onboarding-selection-text]');
    const ctaBtn = onboardingContainer.querySelector('[data-onboarding-cta]');

    const selectOnboardingPlan = (choice) => {
      const { plan, planLabel, planPrice } = choice.dataset;

      choices.forEach((btn) => btn.setAttribute('aria-pressed', String(btn === choice)));
      planCells.forEach((cell) => cell.classList.toggle('is-selected', cell.dataset.plan === plan));

      if (selectionText) {
        selectionText.textContent = `${planLabel} · R$ ${planPrice}`;
      }

      if (ctaBtn) {
        const msg = encodeURIComponent(`Olá! Quero conhecer mais e contratar o Onboarding ${planLabel} do Escala Atende.`);
        ctaBtn.href = `https://api.whatsapp.com/send/?phone=558496530495&text=${msg}`;
      }
    };

    choices.forEach((choice) => {
      choice.addEventListener('click', () => selectOnboardingPlan(choice));
    });

    const initialChoice = choices.find((c) => c.getAttribute('aria-pressed') === 'true') || choices[0];
    if (initialChoice) selectOnboardingPlan(initialChoice);
  }
});
