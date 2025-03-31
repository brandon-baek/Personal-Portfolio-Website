const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

    let currentTheme = localStorage.getItem('theme') || 'light';

    // --- Theme Handling ---
    // Expanded viewBox further for smaller icon appearance, stroke width 2
    const sunIcon = `<svg id="theme-icon" viewBox="-10 -10 44 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonIcon = `<svg id="theme-icon" viewBox="-10 -10 44 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    const applyTheme = (theme) => {
        document.body.classList.toggle('light-mode', theme === 'light');
        const themeIconContainer = $('#theme-toggle');
        if (themeIconContainer) {
            // Directly set innerHTML for reliability
            themeIconContainer.innerHTML = theme === 'light' ? moonIcon : sunIcon;
            // Ensure SVG attributes are correct after setting innerHTML
            const svgElement = themeIconContainer.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('viewBox', '-10 -10 44 44'); // Ensure expanded viewBox further
                svgElement.setAttribute('stroke-width', '2'); // Ensure reverted stroke-width
                // Apply correct stroke/fill based on theme immediately
                if (theme === 'light') {
                    svgElement.style.stroke = 'var(--dark-green)';
                    svgElement.style.fill = 'none';
                } else {
                    svgElement.style.stroke = 'var(--off-white)';
                    // svgElement.style.fill = 'var(--off-white)'; // Optional: fill moon
                }
            }
        }
        localStorage.setItem('theme', theme);
        currentTheme = theme;
        // Let CSS handle nav icon transition sync
    };

    // --- Levenshtein Distance (for potential fuzzy search improvements later) ---
    function levenshteinDistance(a, b) {
      // Implementation omitted for brevity - kept from previous state
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      a = a.toLowerCase();
      b = b.toLowerCase();
      const matrix = [];
      for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
      for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          const cost = a[j - 1] === b[i - 1] ? 0 : 1;
          matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
      }
      return matrix[b.length][a.length];
    }

    function isSimilar(query, text, threshold = 0.6) {
      // Implementation omitted for brevity - kept from previous state
      if (!query || !text) return query === text;
      const distance = levenshteinDistance(query, text);
      const maxLength = Math.max(query.length, text.length);
      if (maxLength === 0) return true;
      const similarity = 1 - distance / maxLength;
      return similarity >= threshold;
    }

    // --- Main DOMContentLoaded Event Listener ---
    document.addEventListener('DOMContentLoaded', () => {
      // --- Element Selectors ---
      const loader = $('#loader');
      const themeToggle = $('#theme-toggle');
      const navItems = $$('.nav-item');
      const sections = $$('section');
      const filterControlsGroup = $('#filter-controls-group'); // Group containing controls + toggle
      const filterControls = $('#filter-controls'); // Container for buttons/dropdowns
      const projectsNodeList = $$('#projects .project-card'); // All project card elements
      const projectsArray = Array.from(projectsNodeList); // Array of project card elements
      const projectsGrid = $('#projects-grid-container'); // Grid container for projects
      const noProjectsMessage = $('#no-projects-message'); // Message div
      const projectSearchInput = $('#project-search'); // Search input field
      const filterLogicToggle = $('#filter-logic-toggle'); // Container for logic radio buttons
      const landingHeading = $('.landing h1'); // Main landing heading
      const aboutToggleBtns = $$('.about-toggle-btn'); // Professional/Brainrot toggle buttons
      const aboutDescriptions = $$('.about-description-content'); // Content divs for about section

      // --- Programming Description Pagination Elements & State ---
      const programmingPages = $$('#programming-description-pages p'); // Paragraphs within the description
      const descPrevPageBtn = $('#prev-page-btn'); // Previous button
      const descNextPageBtn = $('#next-page-btn'); // Next button
      const descPageIndicator = $('#page-indicator'); // Page indicator span
      let descCurrentPage = 0; // Current page index (0-based)
      const descTotalPages = programmingPages.length; // Total number of pages

      // --- About Me Mobile Pagination Elements & State ---
      const aboutProfessionalPagesContainer = $('#about-professional-pages'); // Container for mobile paragraphs
      const aboutProfessionalPages = $$('#about-professional-pages p'); // Paragraphs within the mobile container
      const aboutPrevPageBtn = $('#about-prev-page-btn'); // Previous button for mobile about
      const aboutNextPageBtn = $('#about-next-page-btn'); // Next button for mobile about
      const aboutPageIndicator = $('#about-page-indicator'); // Page indicator for mobile about
      let aboutCurrentPage = 0; // Current page index for mobile about (0-based)
      const aboutTotalPages = aboutProfessionalPages.length; // Total pages for mobile about
      let isAboutPaginated = false; // Track if mobile pagination is active

      // --- Initial Setup ---
      applyTheme(currentTheme); // Apply saved theme or default
      gsap.registerPlugin(ScrollTrigger, Flip); // Register GSAP plugins

      // --- Loader Animation ---
      setTimeout(() => {
        gsap.to(loader, { opacity: 0, duration: 0.5, onComplete: () => loader.classList.add('hidden') });
        gsap.to(landingHeading, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.3 }); // Animate landing heading
      }, 500); // Delay slightly after load

      // --- Theme Toggle ---
      themeToggle.addEventListener('click', () => {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
      });

      // --- Tilt Effect Initialization ---
      let tiltInstances = [];
      // Reduced tilt effect: lower max tilt, slightly less scale, maybe higher perspective
      const tiltOptions = { max: 5, perspective: 2500, scale: 1.02, speed: 500, glare: true, "max-glare": 0.08 };
      function initializeTilt() {
        destroyTilt(); // Remove existing listeners first
        if (window.innerWidth > 768) { // Only apply tilt on wider screens
          const elementsToTilt = document.querySelectorAll(".js-tilt");
          if (elementsToTilt.length > 0) {
              VanillaTilt.init(elementsToTilt, tiltOptions);
              // Store instances if needed for later manipulation (optional)
              elementsToTilt.forEach(el => { if(el.vanillaTilt) tiltInstances.push(el.vanillaTilt) });
          }
        }
      }
      function destroyTilt() {
           const tiltedElements = document.querySelectorAll(".js-tilt");
           tiltedElements.forEach(el => { if (el.vanillaTilt) el.vanillaTilt.destroy(); }); // Destroy existing instances
           tiltInstances = []; // Clear existing instances array
      }
      initializeTilt(); // Initialize tilt on load

      // --- Navigation & ScrollTrigger Setup ---
      const setActiveSection = (sectionId) => {
           sections.forEach(s => { // Update section visibility
               s.classList.toggle('active', s.id === sectionId);
           });
           navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-section') === sectionId)); // Update nav item active state
      }

      const refreshScrollTrigger = () => ScrollTrigger.refresh(true); // Helper to refresh ScrollTrigger
      ScrollTrigger.defaults({}); // Default settings for ScrollTrigger
      refreshScrollTrigger(); // Initial refresh

      // Create ScrollTriggers for each section to handle activation/deactivation
      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 75%", // When section top hits 75% from viewport top
          end: "bottom 25%", // When section bottom hits 25% from viewport top
          onEnter: () => {
              section.classList.add('active'); // Add 'active' class to section
              navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-section') === section.id)); // Update nav active state
          },
          onLeave: () => {
              section.classList.remove('active'); // Remove 'active' when leaving
          },
          onEnterBack: () => {
              section.classList.add('active'); // Add 'active' when scrolling back up
              navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-section') === section.id)); // Update nav active state
          },
          onLeaveBack: () => {
              section.classList.remove('active'); // Remove 'active' when scrolling back up past the start
          },
          invalidateOnRefresh: true // Recalculate on resize/refresh
        });
      });

      // --- GSAP Staggered Fade-in Animation for Social Cards ---
      const socialCards = gsap.utils.toArray('#social .social-card');
      if (socialCards.length > 0) {
         gsap.set(socialCards, { opacity: 0, y: 20 }); // Set initial state (hidden, slightly lower)
         ScrollTrigger.batch(socialCards, {
             interval: 0.08, // Stagger slightly
             batchMax: 4, // Animate in batches
             start: "top bottom-=100px", // Trigger when top hits 100px from bottom
             onEnter: batch => gsap.to(batch, {
                 opacity: 1,
                 y: 0,
                 duration: 0.6,
                 stagger: 0.1,
                 ease: "power1.out",
                 overwrite: true
             }),
             onLeaveBack: batch => gsap.to(batch, { // Animate out when scrolling back up
                 opacity: 0,
                 y: 20,
                 duration: 0.3,
                 stagger: 0.05,
                 ease: "power1.in",
                 overwrite: true
             }),
         });
      }
      // --- End GSAP Social Card Animation ---

      // --- GSAP Staggered Fade-in Animation for Project Cards ---
      const projectCards = gsap.utils.toArray('#projects .project-card');
      if (projectCards.length > 0) {
         gsap.set(projectCards, { opacity: 0, y: 30 }); // Set initial state
         ScrollTrigger.batch(projectCards, {
             interval: 0.1,
             batchMax: 3, // Adjust batch size as needed
             start: "top bottom-=80px", // Trigger slightly earlier (e.g., 80px from bottom)
             onEnter: batch => gsap.to(batch, {
                 opacity: 1,
                 y: 0,
                 duration: 0.7,
                 stagger: 0.15,
                 ease: "power1.out",
                 overwrite: true
             }),
             onLeaveBack: batch => gsap.to(batch, { // Animate out when scrolling back up
                 opacity: 0,
                 y: 30,
                 duration: 0.4,
                 stagger: 0.1,
                 ease: "power1.in",
                 overwrite: true
             }),
         });
      }
      // --- End GSAP Project Card Animation ---


      // --- Skill Accordion Logic ---
      const accordionItems = $$('.skill-accordion-item'); // Get all accordion items
      let openAccordion = null; // Keep track of the currently open item

      accordionItems.forEach(item => {
          const header = item.querySelector('.skill-accordion-header');
          const content = item.querySelector('.skill-accordion-content');
          const skillLevels = content.querySelectorAll('.skill-level'); // Skill bars within the content

          // Set initial state (closed, bars at 0%)
          gsap.set(content, { maxHeight: 0, opacity: 0 });
          gsap.set(skillLevels, { width: '0%' });

          header.addEventListener('click', () => {
              const isOpen = item.classList.contains('active');

              // Close the currently open accordion if it's not this one
              if (openAccordion && openAccordion !== item) {
                  const openHeader = openAccordion.querySelector('.skill-accordion-header');
                  const openContent = openAccordion.querySelector('.skill-accordion-content');
                  const openLevels = openContent.querySelectorAll('.skill-level'); // Get bars of the closing item

                  openHeader.classList.remove('active'); // Deactivate header
                  gsap.to(openContent, { // Animate closed
                      maxHeight: 0, // Collapse height
                      opacity: 0, // Fade out
                      duration: 0.3,
                      ease: 'power1.inOut',
                      onComplete: () => {
                          openAccordion.classList.remove('active'); // Deactivate item
                          gsap.set(openLevels, { width: '0%' }); // Reset skill bars
                          ScrollTrigger.refresh(); // Refresh ScrollTrigger layout
                      }
                  });
              }

              // Toggle the clicked accordion item
              if (!isOpen) { // If it was closed, open it
                  item.classList.add('active');
                  header.classList.add('active');
                  openAccordion = item; // Track the currently open item

                  gsap.to(content, { // Animate open
                      maxHeight: content.scrollHeight, // Expand to content height
                      opacity: 1, // Fade in
                      duration: 0.4,
                      ease: 'power1.inOut',
                      onComplete: () => {
                          // Animate skill bars only after the accordion is open
                          skillLevels.forEach(level => {
                              const percent = level.getAttribute('data-percent') || '0'; // Get percentage from data attribute
                              gsap.to(level, { // Animate width
                                  width: `${percent}%`,
                                  duration: 0.6,
                                  ease: 'power2.out',
                                  delay: 0.1
                              });
                          });
                          ScrollTrigger.refresh(); // Refresh ScrollTrigger layout
                      }
                  });
              } else { // If it was open, close it
                  header.classList.remove('active');
                  gsap.to(content, { // Animate closed
                      maxHeight: 0, // Collapse height
                      opacity: 0, // Fade out
                      duration: 0.3,
                      ease: 'power1.inOut',
                      onComplete: () => {
                          item.classList.remove('active'); // Deactivate item
                          gsap.set(skillLevels, { width: '0%' }); // Reset skill bars
                          openAccordion = null; // Mark no accordion as open
                          ScrollTrigger.refresh(); // Refresh ScrollTrigger layout
                      }
                  });
              }
          });
      });
      // --- End Skill Accordion Logic ---


      // --- Smooth Scrolling for Navigation Links ---
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const sectionId = item.getAttribute('data-section');
          const targetSection = $(`#${sectionId}`);
          if (targetSection) {
             e.preventDefault(); // Prevent default anchor jump
             const offset = sectionId === 'home' ? 0 : 40; // No offset for home, 40px for others
             const bodyRect = document.body.getBoundingClientRect().top;
             const elementRect = targetSection.getBoundingClientRect().top;
             const elementPosition = elementRect - bodyRect;
             const offsetPosition = elementPosition + offset; // Adjust for potential fixed header/nav height

             // Check if already near the target to avoid unnecessary scroll
             if (targetSection.classList.contains('active')) {
                 if (Math.abs(window.scrollY - offsetPosition) < 50) {
                    return; // Don't scroll if already close
                 }
             }
             // Use smooth scroll behavior
             window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

             // Mobile only: Briefly expand the clicked nav item label
             if (window.innerWidth <= 768) {
                 clearTimeout(window.navCollapseTimeout); // Clear previous timeout
                 navItems.forEach(i => i.classList.remove('nav-expanded')); // Collapse others
                 item.classList.add('nav-expanded'); // Expand clicked
                 window.navCollapseTimeout = setTimeout(() => { // Set timeout to collapse after delay
                     item.classList.remove('nav-expanded');
                 }, 2500);
             }
          }
        });
      });

      // --- About Me Photo Swiper ---
      const aboutSwiper = new Swiper('.about-swiper', {
          effect: 'slide', // Can be 'slide', 'fade', 'cube', 'coverflow', 'flip'
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: 1.2, // Show parts of adjacent slides
          spaceBetween: 30,
          speed: 600,
          loop: true, // Enable continuous loop
          pagination: {
              el: '.about-photo .swiper-pagination', // Pagination element
              clickable: true, // Allow clicking on bullets
          },
          autoplay: {
              delay: 3500, // Delay between slides
              disableOnInteraction: false, // Don't stop autoplay on user interaction
          },
          watchSlidesProgress: true, // Needed for some effects
          on: {
              progress: function () { /* Optional progress handling */ },
              setTransition: function (transition) { // Ensure smooth transitions
                  const swiper = this;
                  for (let i = 0; i < swiper.slides.length; i++) {
                      swiper.slides[i].style.transitionDuration = `${transition}ms`;
                  }
              }
          }
      });

      // --- About Me Content Toggle (Professional/Brainrot) ---
      aboutToggleBtns.forEach(btn => {
          btn.addEventListener('click', () => {
              if (btn.classList.contains('active')) return; // Do nothing if already active
              const viewToShow = btn.getAttribute('data-view');
              const targetDesc = $(`#about-${viewToShow}`);
              const currentActiveDesc = $('.about-description-content:not(.hidden)');

              aboutToggleBtns.forEach(b => b.classList.remove('active')); // Deactivate all buttons
              btn.classList.add('active'); // Activate clicked button

              // Animate out the current description
              if (currentActiveDesc) {
                  gsap.to(currentActiveDesc, {
                      opacity: 0, duration: 0.2,
                      onComplete: () => {
                          currentActiveDesc.classList.add('hidden'); // Hide after fade out
                          currentActiveDesc.style.visibility = 'hidden';
                          // Animate in the new description
                          if (targetDesc) {
                              targetDesc.classList.remove('hidden');
                              targetDesc.style.visibility = 'visible';
                              gsap.to(targetDesc, { opacity: 1, duration: 0.3, delay: 0.05 });
                          }
                          gsap.delayedCall(0.1, refreshScrollTrigger); // Refresh ScrollTrigger layout
                      }
                  });
              } else if (targetDesc) { // If no description was active, just fade in the target
                  targetDesc.classList.remove('hidden');
                  targetDesc.style.visibility = 'visible';
                  gsap.to(targetDesc, { opacity: 1, duration: 0.3, onComplete: () => gsap.delayedCall(0.1, refreshScrollTrigger) });
              }
          });
      });

      // --- Project Card Flip Logic ---
      projectsNodeList.forEach(card => {
          let startX, startY, isDragging = false; // Variables for drag detection
          const dragThreshold = 15; // Pixels to move before considering it a drag
          let flipTween = null; // Variable to store the GSAP animation

          card.addEventListener('pointerdown', (e) => {
              // console.log('Pointer Down on card:', card.querySelector('.project-title')?.textContent.trim());
              if (!e.isPrimary) return; // Ignore non-primary pointer events
              startX = e.clientX; // Record starting position
              startY = e.clientY;
              isDragging = false; // Reset dragging flag
          }, { passive: true });

          card.addEventListener('pointermove', (e) => {
              if (!e.isPrimary || !startX || !startY || isDragging) return; // Ignore if not primary, no start, or already dragging
              // Check if pointer moved beyond the threshold
              if (Math.abs(e.clientX - startX) > dragThreshold || Math.abs(e.clientY - startY) > dragThreshold) {
                  isDragging = true; // Set dragging flag
              }
          }, { passive: true });

          card.addEventListener('pointerup', (e) => {
              // console.log('Pointer Up on card:', card.querySelector('.project-title')?.textContent.trim());
              if (!e.isPrimary) return; // Ignore non-primary pointer events
              const wasDragging = isDragging; // Store drag state before resetting
              // Reset drag state variables
              startX = null;
              startY = null;
              isDragging = false;

              // Prevent flip if clicking link or if dragging occurred or if already animating
              if (e.target.closest('.project-link') || wasDragging || (flipTween && flipTween.isActive())) {
                  return; // Exit if flip should be prevented
              }

              const isFlipped = card.classList.contains('flipped');

              // Use GSAP to animate the flip
              flipTween = gsap.to(card, {
                  rotationY: isFlipped ? 0 : 180, // Target rotation
                  duration: 0.6, // Animation duration (adjust as needed)
                  ease: "power1.inOut", // Animation easing
                  onStart: () => {
                      // Optionally add a class during animation if needed for styling
                  },
                  onComplete: () => {
                      card.classList.toggle('flipped'); // Toggle class AFTER animation completes
                      flipTween = null; // Reset tween variable
                  }
              });
          });

          card.addEventListener('pointercancel', (e) => {
               // console.log('Pointer Cancel on card:', card.querySelector('.project-title')?.textContent.trim());
               if (!e.isPrimary) return;
               // Reset drag state variables on cancel
               startX = null;
               startY = null;
               isDragging = false;
          });
      });
      // --- End Project Card Flip Logic ---

      // --- Project Filtering & Search ---
      let activeFilters = { // Store active filters by group
          context: [],
          technology: [], // Combined Area and Language/Framework
          featured: false // Keep featured as a boolean toggle
      };
      let filterLogic = 'and'; // 'and' or 'or'
      let searchQuery = ''; // Current search query

      const filterAndSearchProjects = () => {
          const query = searchQuery.toLowerCase().trim(); // Lowercase and trim search query
          const hasContextFilter = activeFilters.context.length > 0;
          const hasTechnologyFilter = activeFilters.technology.length > 0;
          let visibleProjectCount = 0; // Counter for visible projects

          // console.log('Filtering Projects:', activeFilters, `Logic: ${filterLogic}`, `Query: "${query}"`);

          projectsNodeList.forEach(card => {
              // Get card data
              const cardCategories = (card.getAttribute('data-category') || '').toLowerCase().split(' ').filter(Boolean);
              const titleElFront = card.querySelector('.project-front .project-title');
              const titleElBack = card.querySelector('.project-back .project-title');
              const title = (titleElFront?.textContent || titleElBack?.textContent || '').toLowerCase();
              const description = (card.querySelector('.project-back .project-description')?.textContent || '').toLowerCase();
              const tagsText = cardCategories.join(' '); // Combine categories into a searchable string

              // --- Category Matching ---
              let categoryMatch = true; // Assume match initially

              if (filterLogic === 'and') {
                  // AND Logic: Must match selected filters in *each* active group
                  if (hasContextFilter && !activeFilters.context.some(filter => cardCategories.includes(filter))) {
                      categoryMatch = false;
                  }
                  // For technology, check if *any* selected tech/area tag is present
                  if (categoryMatch && hasTechnologyFilter && !activeFilters.technology.some(filter => cardCategories.includes(filter))) {
                      categoryMatch = false;
                  }
                  if (categoryMatch && activeFilters.featured && !cardCategories.includes('featured')) {
                      categoryMatch = false;
                  }
              } else { // OR Logic
                  // OR Logic: Must match *any* selected filter OR be featured if that's selected
                  let matchesAnyFilter = false;
                  if (hasContextFilter && activeFilters.context.some(filter => cardCategories.includes(filter))) {
                      matchesAnyFilter = true;
                  }
                  // Check if *any* selected tech/area tag is present
                  if (!matchesAnyFilter && hasTechnologyFilter && activeFilters.technology.some(filter => cardCategories.includes(filter))) {
                      matchesAnyFilter = true;
                  }
                  if (!matchesAnyFilter && activeFilters.featured && cardCategories.includes('featured')) {
                      matchesAnyFilter = true;
                  }
                  // If any filters are active (dropdowns or featured), the project must match at least one
                  if ((hasContextFilter || hasTechnologyFilter || activeFilters.featured) && !matchesAnyFilter) {
                      categoryMatch = false;
                  }
                  // If no filters are active at all, all projects match (handled by default categoryMatch = true)
              }


              // --- Search Matching ---
              let searchMatch = true; // Assume match if query is empty
              if (query !== '') { // Check if query is NOT empty
                  searchMatch = false; // Reset searchMatch if query is not empty
                  const titleMatch = title.includes(query);
                  const descMatch = description.includes(query);
                  const tagsMatch = tagsText.includes(query);
                  searchMatch = titleMatch || descMatch || tagsMatch;
              }

              // Determine final visibility
              let shouldShow = categoryMatch && searchMatch; // Use let for potential reassignment (though not needed here, good practice if logic changed)
              // console.log(`  Card: "${title}" -> Cat Match: ${categoryMatch}, Search Match: ${searchMatch}, Show: ${shouldShow}`);

              // Use GSAP.set for immediate visibility changes to avoid animation conflicts
              if (shouldShow) {
                  gsap.set(card, { display: 'grid', opacity: 1, pointerEvents: 'auto' });
                  card.classList.remove('card-filtered-out'); // Keep class for potential styling
                  visibleProjectCount++;
              } else {
                  gsap.set(card, { display: 'none', opacity: 0, pointerEvents: 'none' });
                  card.classList.add('card-filtered-out');
                  // Reset flip state if card is hidden
                  if (card.classList.contains('flipped')) {
                      card.classList.remove('flipped');
                      gsap.set(card, { rotationY: 0 }); // Instantly reset rotation
                  }
              }
          });

          // Show/Hide "No projects found" message
          if (noProjectsMessage) {
              gsap.set(noProjectsMessage, { display: visibleProjectCount === 0 ? 'block' : 'none' });
          }

          gsap.delayedCall(0.1, refreshScrollTrigger); // Refresh ScrollTrigger after layout changes
          initializeTilt(); // Re-initialize tilt for potentially new visible elements
      };

      // --- Filter Dropdown Logic ---
      const setupFilterDropdowns = () => {
          // Define categories and their display names
          const technologyMap = {
              'python': 'Python', 'java': 'Java', 'swift': 'Swift', 'html': 'HTML', 'css': 'CSS',
              'javascript': 'JavaScript', 'keras': 'Keras', 'pandas': 'Pandas', 'numpy': 'NumPy',
              'react-native': 'React Native', 'pytorch': 'PyTorch', 'tensorflow': 'TensorFlow',
              'ai': 'AI/ML', 'datascience': 'Data Science', 'web': 'Web', 'mobile': 'Mobile',
              'miscellaneous': 'Miscellaneous'
          };
          const contextMap = {
              'school': 'School', 'organization': 'Organization', 'student-led': 'Student-Led', 'community': 'Community'
          };

          // Combine and sort technology/area categories
          const combinedTech = [
              ...Object.entries(technologyMap)
                  .filter(([key]) => !['ai', 'datascience', 'web', 'mobile', 'miscellaneous'].includes(key)) // Exclude areas for now
                  .map(([value, display]) => ({ value, display })),
              ...Object.entries(technologyMap)
                  .filter(([key]) => ['ai', 'datascience', 'web', 'mobile', 'miscellaneous'].includes(key)) // Include areas
                  .map(([value, display]) => ({ value, display }))
          ];
          combinedTech.sort((a, b) => a.display.localeCompare(b.display)); // Sort alphabetically by display name

          const contextCategories = Object.entries(contextMap)
              .map(([value, display]) => ({ value, display }))
              .sort((a, b) => a.display.localeCompare(b.display));

          const filterGroups = {
              technology: combinedTech, // Use the combined & sorted list
              context: contextCategories
          };

          // Clear previous dropdowns (if any)
          $$('.filter-dropdown').forEach(dd => dd.remove());

          // Create dropdowns
          Object.entries(filterGroups).forEach(([groupName, categoryList]) => {
              const dropdownDiv = document.createElement('div');
              dropdownDiv.classList.add('filter-dropdown');

              const button = document.createElement('button');
              button.classList.add('filter-dropdown-btn', 'btn-base', 'hover-tilt');
              // Capitalize group name for button text
              const buttonText = groupName === 'technology' ? 'Technology' : groupName.charAt(0).toUpperCase() + groupName.slice(1);
              button.innerHTML = `${buttonText} <span class="arrow"></span>`;

              const panel = document.createElement('div');
              panel.classList.add('filter-dropdown-panel');
              const list = document.createElement('ul');

              // Create checkboxes for the category list
              categoryList.forEach(category => {
                  const item = document.createElement('li');
                  const label = document.createElement('label');
                  label.classList.add('filter-item');
                  const checkbox = document.createElement('input');
                  checkbox.type = 'checkbox';
                  checkbox.value = category.value; // Use the original value (lowercase)
                  checkbox.dataset.group = groupName;
                  label.appendChild(checkbox);
                  label.appendChild(document.createTextNode(` ${category.display}`)); // Use the display name
                  item.appendChild(label);
                  list.appendChild(item);
                  addCheckboxListener(checkbox, button, groupName);
              });

              panel.appendChild(list);
              dropdownDiv.appendChild(button);
              dropdownDiv.appendChild(panel);
              filterControls.appendChild(dropdownDiv); // Append to the correct container

              // Main dropdown toggle listener
              button.addEventListener('click', (e) => {
                  e.stopPropagation();
                  // Close other dropdowns
                  $$('.filter-dropdown-panel.show').forEach(openPanel => {
                      if (openPanel !== panel) {
                          openPanel.classList.remove('show');
                          openPanel.previousElementSibling.classList.remove('open');
                          gsap.to(openPanel, { opacity: 0, y: -5, duration: 0.15, pointerEvents: 'none' }); // Animate closed
                      }
                  });
                  // Toggle current dropdown
                  const isOpen = panel.classList.toggle('show');
                  button.classList.toggle('open', isOpen);
                  if (isOpen) {
                      gsap.to(panel, { opacity: 1, y: 0, duration: 0.2, pointerEvents: 'auto' }); // Animate open
                  } else {
                      gsap.to(panel, { opacity: 0, y: -5, duration: 0.15, pointerEvents: 'none' }); // Animate closed
                  }
              });
          });

          // Helper function to add checkbox listener
          function addCheckboxListener(checkbox, dropdownButton, groupName) {
              checkbox.addEventListener('change', (e) => {
                  const filter = e.target.value;
                  const group = e.target.dataset.group;
                  if (e.target.checked) {
                      if (!activeFilters[group].includes(filter)) {
                          activeFilters[group].push(filter);
                      }
                  } else {
                      activeFilters[group] = activeFilters[group].filter(f => f !== filter);
                  }
                  dropdownButton.classList.toggle('active', activeFilters[group].length > 0);
                  const anyFilterActive = activeFilters.context.length > 0 || activeFilters.technology.length > 0 || activeFilters.featured;
                  $('.filter-btn[data-filter="all"]')?.classList.toggle('active', !anyFilterActive);
                  filterAndSearchProjects();
              });
          }

          // Add listeners for 'All' and 'Featured' buttons
          $$('.filter-btn[data-filter="all"], .filter-btn[data-filter="featured"]').forEach(btn => {
              const newBtn = btn.cloneNode(true);
              btn.parentNode.replaceChild(newBtn, btn);
              newBtn.addEventListener('click', () => {
                  const filter = newBtn.getAttribute('data-filter');
                  if (filter === 'all') {
                      $$('#filter-controls .filter-btn, #filter-controls .filter-dropdown-btn').forEach(b => b.classList.remove('active', 'open'));
                      $$('.filter-dropdown-panel input[type="checkbox"]').forEach(cb => cb.checked = false);
                      $$('.filter-dropdown-panel').forEach(p => {
                          p.classList.remove('show');
                          p.previousElementSibling.classList.remove('open'); // Deactivate button
                          gsap.to(p, { opacity: 0, y: -5, duration: 0.15, pointerEvents: 'none' }); // Animate closed
                      });
                      newBtn.classList.add('active');
                      activeFilters = { context: [], technology: [], featured: false };
                      filterLogic = 'and'; // Reset logic
                      $('#filter-logic-and').checked = true; // Reset radio button
                      // Reset visual state of logic toggle labels
                      $$('.filter-logic-toggle label').forEach(l => l.classList.remove('active'));
                      $('label[for="filter-logic-and"]')?.classList.add('active');
                  } else if (filter === 'featured') {
                      newBtn.classList.toggle('active');
                      activeFilters.featured = newBtn.classList.contains('active');
                      const anyDropdownFilterActive = activeFilters.context.length > 0 || activeFilters.technology.length > 0;
                      $('.filter-btn[data-filter="all"]')?.classList.toggle('active', !activeFilters.featured && !anyDropdownFilterActive);
                  }
                  filterAndSearchProjects();
              });
          });

          // Add listener for filter logic toggle (visual update)
          if (filterLogicToggle) {
              filterLogicToggle.addEventListener('change', (e) => {
                  if (e.target.type === 'radio') {
                      filterLogic = e.target.value;
                      // Update visual state of labels
                      $$('.filter-logic-toggle label').forEach(label => {
                          label.classList.toggle('active', label.getAttribute('for') === e.target.id);
                      });
                      filterAndSearchProjects();
                  }
              });
              // Initial visual state for toggle
              $$('.filter-logic-toggle label').forEach(label => {
                 label.classList.toggle('active', label.getAttribute('for') === 'filter-logic-and');
              });
          }

          // Close dropdowns when clicking outside
          document.addEventListener('click', (e) => {
                      if (!e.target.closest('.filter-dropdown')) {
                          $$('.filter-dropdown-panel.show').forEach(panel => {
                              panel.classList.remove('show');
                              panel.previousElementSibling.classList.remove('open');
                              gsap.to(panel, { opacity: 0, y: -5, duration: 0.15, pointerEvents: 'none' }); // Animate closed
                          });
                      }
                  });

          initializeTilt(); // Re-initialize tilt for new buttons
      };

      setupFilterDropdowns(); // Generate dropdowns on load
      // --- End Filter Dropdown Logic ---


      // --- Search Input Handling ---
      let searchTimeout;
      projectSearchInput.addEventListener('input', () => {
         clearTimeout(searchTimeout); // Debounce input
         searchTimeout = setTimeout(() => {
             searchQuery = projectSearchInput.value; // Update search query
             filterAndSearchProjects(); // Apply filters and search
         }, 300);
      });

      // --- Programming Description Pagination Logic ---
      const updateDescPagination = () => {
          // Fade out current page
          const currentActivePage = $('#programming-description-pages p.active');
          if (currentActivePage && programmingPages[descCurrentPage] !== currentActivePage) {
              currentActivePage.classList.remove('active');
              gsap.to(currentActivePage, { opacity: 0, duration: 0.2 });
          }
          // Fade in new page
          const newActivePage = programmingPages[descCurrentPage];
          if (newActivePage) {
              gsap.set(newActivePage, { opacity: 0 }); // Ensure it starts invisible before fade-in
              newActivePage.classList.add('active');
              gsap.to(newActivePage, { opacity: 1, duration: 0.3, delay: 0.1 });
          }
          // Update indicator text
          if (descPageIndicator) descPageIndicator.textContent = `${descCurrentPage + 1} / ${descTotalPages}`;
          // Enable/disable buttons (Looping logic)
          if (descPrevPageBtn) descPrevPageBtn.disabled = false; // Always enabled for looping
          if (descNextPageBtn) descNextPageBtn.disabled = false; // Always enabled for looping

          // Re-initialize tilt for buttons if on desktop
          if (window.innerWidth > 768) {
              [descPrevPageBtn, descNextPageBtn].forEach(btn => {
                  if (btn && btn.vanillaTilt) { btn.vanillaTilt.destroy(); VanillaTilt.init(btn, tiltOptions); }
                  else if (btn && !btn.vanillaTilt) { VanillaTilt.init(btn, tiltOptions); }
              });
          }
          gsap.delayedCall(0.1, refreshScrollTrigger); // Refresh ScrollTrigger layout
      };

      // Add event listeners for description pagination buttons
      if (descPrevPageBtn && descNextPageBtn && programmingPages.length > 0) {
          descPrevPageBtn.addEventListener('click', () => {
              descCurrentPage = (descCurrentPage - 1 + descTotalPages) % descTotalPages; // Loop back
              updateDescPagination();
          });
          descNextPageBtn.addEventListener('click', () => {
              descCurrentPage = (descCurrentPage + 1) % descTotalPages; // Loop forward
              updateDescPagination();
          });
          updateDescPagination(); // Initialize first page view
      }

      // --- About Me Mobile Pagination Logic ---
      const updateAboutPagination = () => {
          if (!isAboutPaginated || !aboutProfessionalPagesContainer) return; // Only run if mobile pagination is active

          const currentActiveAboutPage = aboutProfessionalPagesContainer.querySelector('p.active');

          // Fade out current page
          if (currentActiveAboutPage && aboutProfessionalPages[aboutCurrentPage] !== currentActiveAboutPage) {
              currentActiveAboutPage.classList.remove('active');
              gsap.to(currentActiveAboutPage, { opacity: 0, duration: 0.2 });
          }

          // Set and fade in new page
          const newActiveAboutPage = aboutProfessionalPages[aboutCurrentPage];
          if (newActiveAboutPage) {
              gsap.set(newActiveAboutPage, { opacity: 0 });
              newActiveAboutPage.classList.add('active');
              gsap.to(newActiveAboutPage, { opacity: 1, duration: 0.3, delay: 0.1 });
          }

          // Update indicator text
          if (aboutPageIndicator) aboutPageIndicator.textContent = `${aboutCurrentPage + 1} / ${aboutTotalPages}`;
          // Enable/disable buttons (Looping logic)
          if (aboutPrevPageBtn) aboutPrevPageBtn.disabled = false; // Always enabled
          if (aboutNextPageBtn) aboutNextPageBtn.disabled = false; // Always enabled

          // Re-initialize tilt for buttons if needed (though tilt is usually disabled on mobile)
          if (window.innerWidth <= 768) {
               [aboutPrevPageBtn, aboutNextPageBtn].forEach(btn => {
                   if (btn && btn.vanillaTilt) { btn.vanillaTilt.destroy(); VanillaTilt.init(btn, tiltOptions); }
                   else if (btn && !btn.vanillaTilt) { VanillaTilt.init(btn, tiltOptions); }
               });
          }
          gsap.delayedCall(0.1, refreshScrollTrigger); // Refresh ScrollTrigger layout
      };

      // Setup function for mobile pagination listeners
      const setupAboutPagination = () => {
          if (aboutPrevPageBtn && aboutNextPageBtn && aboutProfessionalPages.length > 0) {
              // Add listeners only once
              if (!aboutPrevPageBtn.listenerAttached) {
                  aboutPrevPageBtn.addEventListener('click', () => {
                      if (!isAboutPaginated) return;
                      aboutCurrentPage = (aboutCurrentPage - 1 + aboutTotalPages) % aboutTotalPages; // Loop back
                      updateAboutPagination();
                  });
                  aboutPrevPageBtn.listenerAttached = true;
              }
              if (!aboutNextPageBtn.listenerAttached) {
                  aboutNextPageBtn.addEventListener('click', () => {
                      if (!isAboutPaginated) return;
                      aboutCurrentPage = (aboutCurrentPage + 1) % aboutTotalPages; // Loop forward
                      updateAboutPagination();
                  });
                  aboutNextPageBtn.listenerAttached = true;
              }
          }
          isAboutPaginated = true; // Mark as paginated
          updateAboutPagination(); // Initialize the first page view
      };

      // Teardown function for mobile pagination
      const teardownAboutPagination = () => {
          isAboutPaginated = false; // Mark as not paginated
          // Remove active class and reset opacity for paginated paragraphs
          aboutProfessionalPages.forEach(p => {
              p.classList.remove('active');
              gsap.set(p, { clearProps: "opacity" }); // Reset opacity set by GSAP
          });
          // CSS should handle showing/hiding based on media query
          gsap.delayedCall(0.1, refreshScrollTrigger);
      };

      // Initial check on load to set up pagination if needed
      if (window.innerWidth <= 768) {
          setupAboutPagination();
      } else {
          teardownAboutPagination(); // Ensure desktop view is correct initially
      }


       // --- Set Initial Active Section on Load ---
       setTimeout(() => {
            let currentSectionId = 'home'; // Default to home
            let minTopDist = Infinity;
            const viewportCenterY = window.innerHeight / 2;
            // Find the section closest to the center of the viewport
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.height === 0 || rect.width === 0) return; // Ignore hidden sections
                const sectionCenterY = rect.top + rect.height / 2;
                const distFromCenter = Math.abs(sectionCenterY - viewportCenterY);
                // Check if section is at least partially visible and closer than the current minimum
                if (rect.top < window.innerHeight && rect.bottom > 0 && distFromCenter < minTopDist) {
                    minTopDist = distFromCenter;
                    currentSectionId = section.id;
                }
            });
             setActiveSection(currentSectionId); // Activate the determined section
       }, 650); // Delay slightly to allow layout settlement

       // --- Tappable Element Feedback (Mobile) ---
       const tappableElements = gsap.utils.toArray('.nav-item, .theme-toggle, .about-toggle-btn, .filter-btn, #social .social-card, .project-link, .detail-card');
       tappableElements.forEach(el => {
           el.style.webkitTapHighlightColor = 'transparent'; // Remove blue tap highlight on iOS
           let tapTween;
           // Scale down on pointer down
           el.addEventListener('pointerdown', () => {
               if (tapTween) tapTween.kill(); // Kill existing animation
               const scaleAmount = el.closest('.nav-item') ? 0.95 : 0.97; // Slightly different scale for nav items
               tapTween = gsap.to(el, { scale: scaleAmount, duration: 0.1, ease: 'power1.out' });
           }, { passive: true });
           // Scale back up on pointer up/leave/cancel
           const resetScale = () => {
               if (tapTween) tapTween.kill();
               tapTween = gsap.to(el, { scale: 1, duration: 0.2, ease: 'power1.out' });
           };
           el.addEventListener('pointerup', resetScale, { passive: true });
           el.addEventListener('pointerleave', resetScale, { passive: true });
           el.addEventListener('pointercancel', resetScale, { passive: true });
       });


        // --- Resize Handling ---
        let resizeDebounceTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeDebounceTimeout);
            resizeDebounceTimeout = setTimeout(() => {
                // Check viewport width and toggle About Me pagination setup/teardown
                if (window.innerWidth <= 768 && !isAboutPaginated) {
                    setupAboutPagination();
                } else if (window.innerWidth > 768 && isAboutPaginated) {
                    teardownAboutPagination();
                }
                refreshScrollTrigger(); // Refresh ScrollTrigger positions
                initializeTilt(); // Re-initialize tilt effect based on new screen size
            }, 250); // Debounce resize events
        });

    });
