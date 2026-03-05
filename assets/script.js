/* ============================================================
   EriAPI Documentation — Liquid Glass Interactions
   Scroll-reveal, parallax, smooth transitions
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     SCROLL-REVEAL — Animate sections on scroll
     ============================================================ */
  const revealSections = document.querySelectorAll('.doc-section');

  if ('IntersectionObserver' in window && revealSections.length > 0) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.05
    });

    revealSections.forEach(function (section) {
      revealObserver.observe(section);
    });
  } else {
    /* Fallback: reveal everything immediately */
    revealSections.forEach(function (s) { s.classList.add('revealed'); });
  }

  /* Also reveal intro sections and heroes immediately */
  document.querySelectorAll('.section-intro, .hero').forEach(function (el) {
    var parent = el.closest('.doc-section');
    if (parent) parent.classList.add('revealed');
  });

  /* ============================================================
     HEADER SCROLL EFFECT — Glass intensifies on scroll
     ============================================================ */
  var header = document.querySelector('.site-header');
  var lastScrollY = 0;
  var ticking = false;

  function updateHeader() {
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  /* Initial check */
  updateHeader();

  /* ============================================================
     MOBILE MENU — Sidebar toggle with glass overlay
     ============================================================ */
  var menuToggle = document.querySelector('.menu-toggle');
  var sidebar    = document.querySelector('.sidebar');
  var overlay    = document.querySelector('.sidebar-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  overlay.addEventListener('click', closeSidebar);

  /* Close sidebar when a nav link is clicked on mobile */
  sidebar.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  /* ============================================================
     ACTIVE NAV — IntersectionObserver scroll spy
     ============================================================ */
  var sections = document.querySelectorAll('.doc-section[id]');
  var navLinks = document.querySelectorAll('.sidebar .nav-group ul li a');
  var navMap   = {};

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navMap[href.slice(1)] = link;
    }
  });

  function setActive(id) {
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (navMap[id]) {
      navMap[id].classList.add('active');
      /* Scroll nav item into view if needed */
      var navItem = navMap[id];
      if (navItem.offsetTop < sidebar.scrollTop ||
          navItem.offsetTop + navItem.offsetHeight > sidebar.scrollTop + sidebar.clientHeight) {
        navItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  if ('IntersectionObserver' in window && sections.length > 0) {
    var headerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '56'
    );

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-' + (headerH + 24) + 'px 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { navObserver.observe(section); });
  } else {
    /* Fallback: scroll-based */
    window.addEventListener('scroll', function () {
      var current = '';
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= 100) current = section.id;
      });
      if (current) setActive(current);
    }, { passive: true });
  }

  /* ============================================================
     COPY TO CLIPBOARD — With glass-style feedback
     ============================================================ */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrapper = btn.closest('.code-wrapper');
      if (!wrapper) return;
      var codeEl = wrapper.querySelector('code');
      if (!codeEl) return;

      var text = codeEl.innerText || codeEl.textContent;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showCopied(btn);
        }).catch(function () {
          fallbackCopy(text, btn);
        });
      } else {
        fallbackCopy(text, btn);
      }
    });
  });

  function showCopied(btn) {
    var original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch (e) {
      btn.textContent = 'Error';
    }
    document.body.removeChild(ta);
  }

  /* ============================================================
     SMOOTH SCROLL — Anchor links with offset
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var hH = document.querySelector('.site-header')
          ? document.querySelector('.site-header').offsetHeight
          : 56;
        var y = target.getBoundingClientRect().top + window.scrollY - hH - 24;
        window.scrollTo({ top: y, behavior: 'smooth' });

        /* Reveal the section if not already */
        if (!target.classList.contains('revealed')) {
          target.classList.add('revealed');
        }
      }
    });
  });

  /* ============================================================
     SEARCH FILTER — Real-time with glass transitions
     ============================================================ */
  var searchInput = document.getElementById('nav-search');
  if (searchInput) {
    var allSections = document.querySelectorAll('.doc-section[id]');
    var allNavGroups = document.querySelectorAll('.nav-group:not(.nav-pages)');

    searchInput.addEventListener('input', function () {
      var query = this.value.toLowerCase().trim();

      if (!query) {
        allSections.forEach(function (s) {
          s.classList.remove('search-hidden');
          s.classList.add('revealed');
        });
        allNavGroups.forEach(function (g) { g.classList.remove('search-hidden'); });
        return;
      }

      allSections.forEach(function (section) {
        var text = section.textContent.toLowerCase();
        var id = section.id.toLowerCase();
        var matches = text.includes(query) || id.includes(query);
        section.classList.toggle('search-hidden', !matches);
        if (matches) section.classList.add('revealed');
      });

      allNavGroups.forEach(function (group) {
        var links = group.querySelectorAll('a[href^="#"]');
        var anyVisible = false;
        links.forEach(function (link) {
          var href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            var targetSection = document.getElementById(href.slice(1));
            if (targetSection && !targetSection.classList.contains('search-hidden')) {
              anyVisible = true;
            }
          }
        });
        group.classList.toggle('search-hidden', !anyVisible);
      });
    });

    /* Clear search on Escape */
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        this.dispatchEvent(new Event('input'));
        this.blur();
      }
    });
  }

  /* ============================================================
     CARD TILT — Subtle glass refraction effect on hover
     ============================================================ */
  document.querySelectorAll('.card, .module-card, .qs-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rotateX = (y - 0.5) * -4;
      var rotateY = (x - 0.5) * 4;
      card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-2px)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ============================================================
     HIGHLIGHT.JS INIT
     ============================================================ */
  if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
  }

});
