/* =========================
 Accordion animation js 
=========================== */

const accordionAnimation = {
  accordionItems: null,
  activeItem: null,
  itemElements: new Map(),

  init() {
    this.accordion = document.querySelector('.accordion');
    this.accordionItems = document.querySelectorAll('.accordion-item');
    this.activeItem = null;
    this.itemElements.clear();

    // Fetch all elements for each accordion item
    this.accordionItems.forEach((item) => {
      const elements = {
        action: item.querySelector('.accordion-action'),
        content: item.querySelector('.accordion-content'),
        plusIconSpans: item.querySelectorAll('.accordion-plus-icon span'),
        accordionArrow: item.querySelector('.accordion-arrow svg'),
        accordionArrowSpan: item.querySelector('.accordion-arrow'),
      };
      this.itemElements.set(item, elements);

      if (item.classList.contains('active-accordion')) {
        elements.content.classList.remove('hidden');
        elements.content.style.height = 'auto';
        this.activeItem = item;
        this.setOpenState(item, elements);
      } else {
        elements.content.classList.add('hidden');
        this.setClosedState(item, elements);
      }

      elements.action.addEventListener('click', (e) => {
        e.preventDefault();

        if (this.activeItem && this.activeItem !== item) {
          this.closeAccordion(this.activeItem, this.itemElements.get(this.activeItem));
        }

        if (this.activeItem === item) {
          this.closeAccordion(item, elements);
          this.activeItem = null;
        } else {
          this.openAccordion(item, elements);
          this.activeItem = item;
        }
      });
    });
    this.initAnimation();
  },

  setOpenState(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'true';
    action.dataset.state = 'true';
    content.dataset.state = 'true';

    // Set icon states for default open item
    if (plusIconSpans.length > 0) {
      plusIconSpans[1].style.transform = 'rotate(90deg)';
      plusIconSpans[1].dataset.state = 'true';
    }

    if (accordionArrow) {
      accordionArrow.style.transform = 'rotate(180deg)';
      accordionArrow.dataset.state = 'true';
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'true';
    }
  },

  setClosedState(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'false';
    action.dataset.state = 'false';
    content.dataset.state = 'false';

    // Set icon states for closed item
    if (plusIconSpans.length > 0) {
      plusIconSpans[1].dataset.state = 'false';
    }

    if (accordionArrow) {
      accordionArrow.dataset.state = 'false';
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'false';
    }
  },

  initAnimation() {
    this.accordionItems.forEach((item, index) => {
      // Set initial state
      gsap.set(item, {
        opacity: 0,
        y: 50,
        filter: 'blur(20px)',
        overflow: 'hidden',
      });

      // Create scroll trigger animation
      gsap.fromTo(
        item,
        {
          opacity: 0,
          y: 50,
          filter: 'blur(20px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            end: 'top 50%',
            scrub: false,
            once: true,
          },
        }
      );
    });
  },

  openAccordion(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'true';
    action.dataset.state = 'true';
    content.dataset.state = 'true';
    content.classList.remove('hidden');
    content.style.height = 'auto';
    const contentHeight = content.scrollHeight;
    content.style.height = '0px';

    gsap.to(content, {
      height: contentHeight,
      opacity: 1,
      duration: 0.3,
    });

    if (plusIconSpans.length > 0) {
      gsap.to(plusIconSpans[1], {
        rotation: 90,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          plusIconSpans[1].dataset.state = 'true';
        },
      });
    }

    if (accordionArrow) {
      accordionArrow.dataset.state = 'true';
      gsap.to(accordionArrow, {
        rotation: -180,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'true';
    }
  },

  closeAccordion(item, elements) {
    const { action, content, plusIconSpans, accordionArrow, accordionArrowSpan } = elements;

    item.dataset.state = 'false';
    action.dataset.state = 'false';

    content.style.height = 'auto';
    const contentHeight = content.scrollHeight;

    content.style.height = contentHeight + 'px';

    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        content.classList.add('hidden');
        content.style.height = '0px';
        content.dataset.state = 'false';
      },
    });

    // Animate minus icon back to plus (if exists)
    if (plusIconSpans.length > 0) {
      gsap.to(plusIconSpans[1], {
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          plusIconSpans[1].dataset.state = 'false';
        },
      });
    }

    // Animate accordion arrow back (if exists)
    if (accordionArrow) {
      accordionArrow.dataset.state = 'false';
      gsap.to(accordionArrow, {
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    if (accordionArrowSpan) {
      accordionArrowSpan.dataset.state = 'false';
    }
  },
};

if (typeof window !== 'undefined') {
  accordionAnimation.init();
}
