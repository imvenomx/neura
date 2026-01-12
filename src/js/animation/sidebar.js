/* =========================
 Sidebar menu animation js 
=========================== */
const sidebarAnimation = {
  elements: null,

  init() {
    try {
      this.cacheElements();
      this.bindEvents();
    } catch (error) {
      console.error('Sidebar animation initialization failed:', error);
    }
  },

  cacheElements() {
    this.elements = {
      navHamburger: document.querySelector('.nav-hamburger'),
      navHamburgerClose: document.querySelector('.nav-hamburger-close'),
      sidebar: document.querySelector('.sidebar'),
      subMenu: document.querySelectorAll('.sub-menu'),
      mobileMenuLinks: document.querySelectorAll('.mobile-menu-link'),
    };
  },

  bindEvents() {
    const { navHamburger, navHamburgerClose, subMenu, mobileMenuLinks } = this.elements;

    if (navHamburger) {
      navHamburger.addEventListener('click', () => {
        this.elements.sidebar.classList.add('show-sidebar');
        document.body.classList.add('overflow-hidden');
      });
    }

    if (navHamburgerClose) {
      navHamburgerClose.addEventListener('click', () => {
        this.elements.sidebar.classList.remove('show-sidebar');
        document.body.classList.remove('overflow-hidden');
      });
    }

    // Close sidebar when mobile menu links are clicked (with delay to allow scroll to start)
    mobileMenuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        // Small delay to allow scroll to initiate before closing menu
        setTimeout(() => {
          this.elements.sidebar.classList.remove('show-sidebar');
          document.body.classList.remove('overflow-hidden');
        }, 100);
      });
    });

    subMenu.forEach((menu) => {
      menu.addEventListener('click', () => {
        menu.classList.toggle('active-menu');
        menu.nextElementSibling.classList.toggle('hidden');
        menu.children[1].classList.toggle('rotate-90');

        subMenu.forEach((otherMenu) => {
          if (otherMenu !== menu) {
            otherMenu.nextElementSibling.classList.add('hidden');
            otherMenu.children[1].classList.remove('rotate-90');
            otherMenu.classList.remove('active-menu');
          }
        });
      });
    });
  },
};

if (typeof window !== 'undefined') {
  sidebarAnimation.init();
}
