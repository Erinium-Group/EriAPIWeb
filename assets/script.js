/* ============================================================
   EriAPI Documentation — Shared Scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Mobile menu toggle ------------------------------------ */
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar    = document.querySelector('.sidebar');
  let overlay      = document.querySelector('.sidebar-overlay');

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
      if (window.innerWidth <= 720) closeSidebar();
    });
  });

  /* ---- Active nav via IntersectionObserver ------------------- */
  const sections    = document.querySelectorAll('.doc-section[id]');
  const navLinks    = document.querySelectorAll('.sidebar .nav-group ul li a');
  const navMap      = {};

  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      navMap[href.slice(1)] = link;
    }
  });

  function setActive(id) {
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (navMap[id]) {
      navMap[id].classList.add('active');
      /* Scroll nav item into view if needed */
      const navItem = navMap[id];
      const sb = sidebar;
      if (navItem.offsetTop < sb.scrollTop ||
          navItem.offsetTop + navItem.offsetHeight > sb.scrollTop + sb.clientHeight) {
        navItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  if ('IntersectionObserver' in window && sections.length > 0) {
    const headerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '52'
    );

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-' + (headerH + 24) + 'px 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { observer.observe(section); });
  } else {
    /* Fallback: scroll-based detection */
    window.addEventListener('scroll', function () {
      let current = '';
      sections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) current = section.id;
      });
      if (current) setActive(current);
    }, { passive: true });
  }

  /* ---- Copy to clipboard ------------------------------------- */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const wrapper = btn.closest('.code-wrapper');
      if (!wrapper) return;
      const codeEl = wrapper.querySelector('code');
      if (!codeEl) return;

      const text = codeEl.innerText || codeEl.textContent;

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
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1800);
  }

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top  = '-9999px';
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

  /* ---- Smooth scroll for anchor links ------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const headerH = document.querySelector('.site-header')
          ? document.querySelector('.site-header').offsetHeight
          : 52;
        const y = target.getBoundingClientRect().top + window.scrollY - headerH - 20;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ---- Real-time search filter --------------------------------- */
  const searchInput = document.getElementById('nav-search');
  if (searchInput) {
    const allSections = document.querySelectorAll('.doc-section[id]');
    const allNavGroups = document.querySelectorAll('.nav-group:not(.nav-pages)');

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();

      if (!query) {
        // Show everything
        allSections.forEach(function (s) { s.classList.remove('search-hidden'); });
        allNavGroups.forEach(function (g) { g.classList.remove('search-hidden'); });
        return;
      }

      // Filter sections
      allSections.forEach(function (section) {
        const text = section.textContent.toLowerCase();
        const id = section.id.toLowerCase();
        const matches = text.includes(query) || id.includes(query);
        section.classList.toggle('search-hidden', !matches);
      });

      // Filter nav groups: hide if all their links' sections are hidden
      allNavGroups.forEach(function (group) {
        const links = group.querySelectorAll('a[href^="#"]');
        let anyVisible = false;
        links.forEach(function (link) {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            const targetSection = document.getElementById(href.slice(1));
            if (targetSection && !targetSection.classList.contains('search-hidden')) {
              anyVisible = true;
            }
          }
        });
        group.classList.toggle('search-hidden', !anyVisible);
      });
    });

    // Clear search on Escape
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        this.value = '';
        this.dispatchEvent(new Event('input'));
        this.blur();
      }
    });
  }

  /* ---- Highlight.js init ------------------------------------- */
  if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
  }

});
