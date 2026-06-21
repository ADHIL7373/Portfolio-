/**
 * PREMIUM BLACK & GOLD PORTFOLIO JAVASCRIPT
 * Performance-optimized animations, LERP parallax, and menu handlers.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CONFIGURATION & STATE
    // ==========================================
    const state = {
        currentScroll: window.scrollY || window.pageYOffset,
        targetScroll: window.scrollY || window.pageYOffset,
        // EDIT HERE: Easing value (0.05 - 0.2). Smaller = smoother/slower parallax transitions.
        ease: 0.08, 
        mobileBreakpoint: 768,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    const contactFormState = {
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0
    };

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const progressBar = document.getElementById('scroll-progress-bar');

    const skillsGrid = document.querySelector('.skills-grid-staggered');
    const skillsPath = document.querySelector('.skills-connector-path');
    const certsSection = document.querySelector('.certificates-section');
    const certsRowsContainer = document.querySelector('.cert-interactive-rows');
    const certRows = document.querySelectorAll('.cert-interactive-row');
    const certPreviews = document.querySelectorAll('.cert-preview-img-wrapper');
    const certsTimelinePath = document.querySelector('.cert-timeline-path');

    const listContainer = document.querySelector('.editorial-projects-list');
    const pathMain = document.querySelector('.project-path-main');
    const pathGlow = document.querySelector('.project-path-glow');
    const pathDot = document.querySelector('.project-path-dot');
    const showcases = document.querySelectorAll('.project-showcase');

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    // ==========================================
    // 1.1 LAYOUT METRICS CACHING (Performance Boost to avoid FSL/Layout Thrashing)
    // ==========================================
    let cachedParallaxScrollElements = [];
    let cachedParallaxLayers = [];
    let cachedProjectConnector = { absTop: 0, height: 0, pathLength: 0 };
    let cachedSkillsConnector = { absTop: 0, height: 0, pathLength: 0 };
    let cachedCertsTimeline = { absTop: 0, height: 0, pathLength: 0 };

    function cacheLayoutMetrics() {
        const scrollY = window.scrollY || window.pageYOffset;

        // Cache non-hero parallax elements
        const parallaxScrollElements = document.querySelectorAll('.parallax-scroll-el');
        cachedParallaxScrollElements = Array.from(parallaxScrollElements).map(el => {
            const rect = el.getBoundingClientRect();
            return {
                el: el,
                absTop: rect.top + scrollY,
                height: rect.height,
                speed: parseFloat(el.getAttribute('data-scroll-speed')) || 0
            };
        });

        // Cache hero layers
        cachedParallaxLayers = Array.from(parallaxLayers).map(layer => {
            return {
                layer: layer,
                speed: parseFloat(layer.getAttribute('data-speed')) || 0
            };
        });

        // Cache projects connector
        if (listContainer) {
            const rect = listContainer.getBoundingClientRect();
            cachedProjectConnector.absTop = rect.top + scrollY;
            cachedProjectConnector.height = rect.height;
        }

        // Cache skills connector
        if (skillsGrid) {
            const rect = skillsGrid.getBoundingClientRect();
            cachedSkillsConnector.absTop = rect.top + scrollY;
            cachedSkillsConnector.height = rect.height;
        }

        // Cache certificates connector
        if (certsRowsContainer) {
            const rect = certsRowsContainer.getBoundingClientRect();
            cachedCertsTimeline.absTop = rect.top + scrollY;
            cachedCertsTimeline.height = rect.height;
        }
    }

    // Initialize layout metrics
    cacheLayoutMetrics();

    // ==========================================
    // 2. SMOOTH LERP PARALLAX LOOP (requestAnimationFrame)
    // ==========================================
    
    // Linear Interpolation helper
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    // Scroll event listener (passive for scroll performance)
    window.addEventListener('scroll', () => {
        state.targetScroll = window.scrollY || window.pageYOffset;
        
        // Update Scroll Progress bar width
        if (progressBar) {
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (state.targetScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }
    }, { passive: true });

    // Parallax update ticker
    function tick() {
        // Stop parallax calculations if reduced motion is enabled
        if (state.prefersReducedMotion) return;

        // Perform LERP transition
        state.currentScroll = lerp(state.currentScroll, state.targetScroll, state.ease);

        // Smooth contact form mouse-parallax
        if (contactForm && window.innerWidth > state.mobileBreakpoint) {
            contactFormState.currentX = lerp(contactFormState.currentX, contactFormState.targetX, 0.08);
            contactFormState.currentY = lerp(contactFormState.currentY, contactFormState.targetY, 0.08);
            
            contactForm.style.transform = `translate3d(${contactFormState.currentX}px, ${contactFormState.currentY}px, 0)`;
        }

        // Limit updates only when scrolling is active
        if (Math.abs(state.currentScroll - state.targetScroll) > 0.05) {
            
            // A. Update Hero Parallax Layers (Only on Desktop)
            if (viewportWidth > state.mobileBreakpoint) {
                cachedParallaxLayers.forEach(item => {
                    const yOffset = -(state.currentScroll * item.speed);
                    item.layer.style.transform = `translate3d(0, ${yOffset}px, 0)`;
                });
            }

            // B. Update Non-Hero Parallax elements (Watermarks, Titles, Images)
            if (viewportWidth > 600) {
                cachedParallaxScrollElements.forEach(item => {
                    const rectTop = item.absTop - state.currentScroll;
                    const rectBottom = rectTop + item.height;
                    const elementCenter = rectTop + (item.height / 2);
                    const viewportCenter = viewportHeight / 2;
                    
                    // Distance of the element relative to the center of the screen
                    const distance = elementCenter - viewportCenter;
                    
                    // Translate on scroll relative to viewport center
                    const yOffset = distance * item.speed;
                    
                    // Check if element is inside viewport margins
                    if (rectBottom > -100 && rectTop < viewportHeight + 100) {
                        item.el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
                    }
                });
            }

            // C. Update storytelling project connector drawing progress
            animateProjectConnector();

            // D. Update skills vertical connector drawing progress
            animateSkillsConnector();

            // E. Update certificates vertical timeline connector drawing progress
            animateCertsTimeline();
        }

        requestAnimationFrame(tick);
    }

    // Initialize animation ticker
    if (!state.prefersReducedMotion) {
        requestAnimationFrame(tick);
    }

    // Re-verify reduced motion state changes in real time
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        state.prefersReducedMotion = e.matches;
        if (state.prefersReducedMotion) {
            // Clear inline styles
            parallaxLayers.forEach(layer => {
                layer.style.transform = '';
            });
            document.querySelectorAll('.parallax-scroll-el').forEach(el => {
                el.style.transform = '';
            });
        } else {
            requestAnimationFrame(tick);
        }
    });

    // ==========================================
    // 3. NAVBAR STYLING & ACTIVE LINK HIGHLIGHTING
    // ==========================================
    
    // Toggle solid background color on scroll
    function updateNavbarState() {
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
            if (scrollToTopBtn) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.pointerEvents = 'auto';
            }
        } else {
            navbar.classList.remove('scrolled');
            if (scrollToTopBtn) {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.pointerEvents = 'none';
            }
        }
    }
    
    window.addEventListener('scroll', updateNavbarState, { passive: true });
    updateNavbarState(); // Initial run

    // Highlight current active section in nav links using IntersectionObserver
    const sections = document.querySelectorAll('header, section');
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Trigger active state when section takes substantial center stage
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ==========================================
    // 4. MOBILE HAMBURGER MENU
    // ==========================================
    function toggleMobileMenu() {
        navToggle.classList.toggle('open');
        navLinksContainer.classList.toggle('open');
        
        // Prevent body scrolling when mobile overlay is active
        if (navLinksContainer.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer && navLinksContainer.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // ==========================================
    // 5. SMOOTH INTERCEPT ANCHOR SCROLL
    // ==========================================
    // Offset standard scroll positioning to avoid navbar overlapping titles
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Bypass default scroll behavior for same-page anchors
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const navHeight = navbar.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
                    const offsetPosition = elementPosition - navHeight + 10; // Extra padding for layout spacing
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Scroll to top button functionality
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================
    // 6. SCROLL REVEAL ANIMATIONS
    // ==========================================
    const revealObserverOptions = {
        root: null,
        threshold: 0.18 // Trigger animation immediately when 18% of section is visible
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Trigger stats countup
                if (entry.target.classList.contains('about-section')) {
                    animateStats();
                }
                
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(elem => {
        revealObserver.observe(elem);
    });

    // ==========================================
    // 7. STATS COUNT-UP ANIMATION
    // ==========================================
    let statsAnimated = false;
    
    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        const statNums = document.querySelectorAll('.stat-number');
        statNums.forEach(numElement => {
            if (numElement.getAttribute('data-is-text') === 'true') {
                return;
            }
            const targetVal = parseInt(numElement.getAttribute('data-val')) || 0;
            const duration = 2000; // 2 seconds
            const stepTime = Math.abs(Math.floor(duration / targetVal));
            let currentVal = 0;
            
            // Prevent division by zero or large delays
            const intervalTime = Math.max(stepTime, 20); 
            
            const timer = setInterval(() => {
                currentVal += Math.ceil(targetVal / (duration / intervalTime));
                if (currentVal >= targetVal) {
                    numElement.textContent = targetVal + '+';
                    clearInterval(timer);
                } else {
                    numElement.textContent = currentVal + '+';
                }
            }, intervalTime);
        });
    }

    // ==========================================
    // 8. CERTIFICATES INTERACTIVE VIEWPORT SHOWCASE
    // ==========================================
    
    // Click or hover to switch preview active state
    certRows.forEach(row => {
        const index = row.getAttribute('data-index');
        
        const activateRow = () => {
            // Reset active states
            certRows.forEach(r => r.classList.remove('active'));
            certPreviews.forEach(p => p.classList.remove('active'));
            
            // Deactivate placeholder if active
            const certPlaceholder = document.querySelector('.cert-placeholder-wrapper');
            if (certPlaceholder) {
                certPlaceholder.classList.remove('active');
            }
            
            // Activate selected row
            row.classList.add('active');
            
            // Crossfade target image wrapper
            const targetPreview = document.querySelector(`.cert-preview-img-wrapper[data-index="${index}"]`);
            if (targetPreview) {
                targetPreview.classList.add('active');
            }
        };

        row.addEventListener('mouseenter', activateRow);
        row.addEventListener('click', activateRow);
    });

    // Helper to reset certificates showcase to placeholder state
    const resetCertificatesPreview = () => {
        certRows.forEach(r => r.classList.remove('active'));
        certPreviews.forEach(p => p.classList.remove('active'));
        
        const certPlaceholder = document.querySelector('.cert-placeholder-wrapper');
        if (certPlaceholder) {
            certPlaceholder.classList.add('active');
        }
    };

    // Reset when cursor leaves the certificates grid (list and preview columns)
    const certsLayoutGrid = document.querySelector('.certs-layout-grid');
    if (certsLayoutGrid) {
        certsLayoutGrid.addEventListener('mouseleave', resetCertificatesPreview);
    }

    // Reset when user scrolls away from the Certificates section
    if (certsSection) {
        const certsScrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    resetCertificatesPreview();
                }
            });
        }, {
            root: null,
            threshold: 0.0 // Triggers when the section is completely out of the viewport
        });
        certsScrollObserver.observe(certsSection);
    }

    // Stagger reveal IntersectionObserver for Certificates Section
    const certsRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const revealItems = [
                    certsSection.querySelector('.section-index'),
                    certsSection.querySelector('.section-title-editorial'),
                    certsSection.querySelector('.sidebar-intro'),
                    ...certsSection.querySelectorAll('.cert-interactive-row'),
                    certsSection.querySelector('.certs-preview-column')
                ];
                
                revealItems.forEach((item, index) => {
                    if (item) {
                        setTimeout(() => {
                            item.classList.add('revealed');
                        }, index * 100); // 100ms stagger delay
                    }
                });
                
                certsRevealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (certsSection) {
        certsRevealObserver.observe(certsSection);
    }

    // Stagger reveal IntersectionObserver for Get In Touch Section
    const contactSection = document.getElementById('contact');
    const contactRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const revealItems = [
                    contactSection.querySelector('.section-index'),
                    contactSection.querySelector('.section-title-editorial'),
                    contactSection.querySelector('.contact-intro-text'),
                    ...contactSection.querySelectorAll('.form-group-row'),
                    contactSection.querySelector('.btn-submit-editorial')
                ];
                
                revealItems.forEach((item, index) => {
                    if (item) {
                        setTimeout(() => {
                            item.classList.add('revealed');
                        }, index * 100); // 100ms stagger delay
                    }
                });
                
                contactRevealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    if (contactSection) {
        contactRevealObserver.observe(contactSection);
    }

    // Scroll drawing calculation for certificates timeline
    function updateCertsTimeline() {
        if (window.innerWidth < 1024) return;
        if (!certsTimelinePath || !certsRowsContainer) return;
        const rect = certsRowsContainer.getBoundingClientRect();
        cachedCertsTimeline.absTop = rect.top + (window.scrollY || window.pageYOffset);
        cachedCertsTimeline.height = rect.height;

        const pathLength = certsTimelinePath.getTotalLength();
        cachedCertsTimeline.pathLength = pathLength;
        certsTimelinePath.style.strokeDasharray = pathLength;
        animateCertsTimeline();
    }

    function animateCertsTimeline() {
        if (!certsTimelinePath || !certsRowsContainer) return;

        const sectionTop = cachedCertsTimeline.absTop - state.currentScroll;
        const sectionHeight = cachedCertsTimeline.height;

        const startScroll = sectionTop - viewportHeight;
        const endScroll = sectionTop + sectionHeight - (viewportHeight * 0.85);

        const totalScrollable = endScroll - startScroll;
        if (totalScrollable <= 0) return;

        let progress = -startScroll / totalScrollable;
        progress = Math.max(0, Math.min(1, progress));

        const pathLength = cachedCertsTimeline.pathLength;
        const offset = pathLength * (1 - progress);

        certsTimelinePath.style.strokeDashoffset = offset;
    }

    // ==========================================
    // 8b. CONTACT FORM MOUSE PARALLAX LISTENERS
    // ==========================================
    if (contactSection && contactForm) {
        contactSection.addEventListener('mousemove', (e) => {
            if (state.prefersReducedMotion || window.innerWidth < state.mobileBreakpoint) return;

            const rect = contactSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;

            // Shift form relative to cursor by max 4px
            const maxParallaxShift = 4;
            contactFormState.targetX = percentX * maxParallaxShift;
            contactFormState.targetY = percentY * maxParallaxShift;
        }, { passive: true });

        contactSection.addEventListener('mouseleave', () => {
            contactFormState.targetX = 0;
            contactFormState.targetY = 0;
        });
    }

    // ==========================================
    // 9. CONTACT FORM SUBMISSION HANDLER (EMAILJS INTEGRATION)
    // ==========================================
    
    // -------------------------------------------------------------
    // PLACE YOUR EMAILJS CREDENTIALS HERE:
    // 1. Log in to your EmailJS account (https://dashboard.emailjs.com/)
    // 2. Go to 'Account' (or 'API Keys') to get your Public Key.
    // 3. Go to 'Email Services' to create a service and get your Service ID.
    // 4. Go to 'Email Templates' to create a template and get your Template ID.
    // 5. In your template settings, ensure the recipient email matches: a.mohammedasik2006@gmail.com
    // -------------------------------------------------------------
    const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // Replace with your EmailJS Public Key
    const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID"; // Replace with your EmailJS Service ID
    const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // Replace with your EmailJS Template ID

    // Initialize EmailJS with Public Key
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
            publicKey: EMAILJS_PUBLIC_KEY,
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit-editorial');
            const submitBtnTextSpan = submitBtn.querySelector('span');
            const originalBtnText = submitBtnTextSpan.textContent;

            // Form validation values
            const nameVal = document.getElementById('name').value.trim();
            const emailVal = document.getElementById('email').value.trim();
            const subjectVal = document.getElementById('subject').value.trim();
            const messageVal = document.getElementById('message').value.trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Reset status block
            formStatus.className = 'form-status-editorial';
            formStatus.textContent = '';
            formStatus.style.opacity = '1';

            // Validate all fields
            if (!nameVal) {
                formStatus.classList.add('error');
                formStatus.textContent = 'Name is required.';
                return;
            }
            if (!emailVal || !emailRegex.test(emailVal)) {
                formStatus.classList.add('error');
                formStatus.textContent = 'Please enter a valid email address.';
                return;
            }
            if (!subjectVal) {
                formStatus.classList.add('error');
                formStatus.textContent = 'Subject is required.';
                return;
            }
            if (!messageVal) {
                formStatus.classList.add('error');
                formStatus.textContent = 'Message is required.';
                return;
            }

            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtnTextSpan.textContent = 'Sending...';
            formStatus.textContent = 'Transmitting message...';

            if (typeof emailjs === 'undefined') {
                console.error('EmailJS SDK failed to load.');
                formStatus.className = 'form-status-editorial error';
                formStatus.textContent = 'Failed to send message. Please try again.';
                resetButton();
                return;
            }

            // Send email using EmailJS SDK
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                from_name: nameVal,
                from_email: emailVal,
                reply_to: emailVal,
                subject: subjectVal,
                message: messageVal,
                to_email: 'a.mohammedasik2006@gmail.com'
            })
            .then(() => {
                formStatus.className = 'form-status-editorial success';
                formStatus.textContent = 'Your message has been sent successfully.';
                contactForm.reset();
                resetButton();
                autoFadeStatus();
            })
            .catch((error) => {
                console.error('EmailJS Send Error:', error);
                formStatus.className = 'form-status-editorial error';
                formStatus.textContent = 'Failed to send message. Please try again.';
                resetButton();
                autoFadeStatus();
            });

            function resetButton() {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtnTextSpan.textContent = originalBtnText;
            }

            function autoFadeStatus() {
                setTimeout(() => {
                    formStatus.style.transition = 'opacity 500ms ease';
                    formStatus.style.opacity = '0';
                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.style.opacity = '1';
                        formStatus.className = 'form-status-editorial';
                    }, 500);
                }, 6000);
            }
        });
    }

    // ==========================================
    // 10. SKILL CARDS INTERACTIONS
    // ==========================================
    const skillCards = document.querySelectorAll('.skill-card-premium');
    
    skillCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (state.prefersReducedMotion) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate within client bounds
            const y = e.clientY - rect.top;  // y coordinate within client bounds
            
            // Cursor follow coordinates variable for the radial hover highlight
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Calculate mouse parallax translation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Normalized offset (-1 to 1)
            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;
            
            // Max movement only 3px to 5px (3.5px used here)
            const maxMove = 3.5;
            const moveX = percentX * maxMove;
            const moveY = percentY * maxMove;
            
            // Set transforms on inner wrapper to avoid overwriting float keyframes
            const inner = card.querySelector('.skill-card-inner');
            if (inner) {
                inner.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            }
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            // Reset inner translation
            const inner = card.querySelector('.skill-card-inner');
            if (inner) {
                inner.style.transform = '';
            }
        });
    });

    // ==========================================
    // 11. PROJECT CONNECTOR LINE (S-shaped Scroll-draw)
    // ==========================================
    function updateProjectConnector() {
        if (window.innerWidth < 1024) return;
        if (!listContainer || !pathMain || !pathGlow || showcases.length < 2) return;

        const scrollY = window.scrollY || window.pageYOffset;
        const listRect = listContainer.getBoundingClientRect();
        
        cachedProjectConnector.absTop = listRect.top + scrollY;
        cachedProjectConnector.height = listRect.height;

        // Get centers of the alternating project cards
        const getCardCenter = (showcase) => {
            const media = showcase.querySelector('.parallax-media-container');
            if (!media) return { x: 0, y: 0 };
            const rect = media.getBoundingClientRect();
            return {
                x: rect.left - listRect.left + (rect.width / 2),
                y: rect.top - listRect.top + (rect.height / 2)
            };
        };

        const points = Array.from(showcases).map(getCardCenter);
        let pathData = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const pStart = points[i];
            const pEnd = points[i + 1];
            const midY = (pStart.y + pEnd.y) / 2;
            pathData += ` C ${pStart.x} ${midY}, ${pEnd.x} ${midY}, ${pEnd.x} ${pEnd.y}`;
        }

        pathMain.setAttribute('d', pathData);
        pathGlow.setAttribute('d', pathData);

        const pathLength = pathMain.getTotalLength();
        cachedProjectConnector.pathLength = pathLength;
        pathMain.style.strokeDasharray = pathLength;
        pathGlow.style.strokeDasharray = pathLength;

        animateProjectConnector();
    }

    function animateProjectConnector() {
        if (!listContainer || !pathMain || !pathGlow) return;

        const sectionTop = cachedProjectConnector.absTop - state.currentScroll;
        const sectionHeight = cachedProjectConnector.height;

        const startScroll = sectionTop - viewportHeight;
        const endScroll = sectionTop + sectionHeight - (viewportHeight * 0.9);

        const totalScrollable = endScroll - startScroll;
        if (totalScrollable <= 0) return;

        let progress = -startScroll / totalScrollable;
        progress = Math.max(0, Math.min(1, progress));

        const pathLength = cachedProjectConnector.pathLength;
        const offset = pathLength * (1 - progress);

        pathMain.style.strokeDashoffset = offset;
        pathGlow.style.strokeDashoffset = offset;

        // Update dot position and visibility
        if (pathDot) {
            try {
                const point = pathMain.getPointAtLength(pathLength * progress);
                pathDot.setAttribute('cx', point.x);
                pathDot.setAttribute('cy', point.y);
                
                // Hide dot when path is completely hidden or completely drawn
                if (progress > 0.01 && progress < 0.99) {
                    pathDot.style.opacity = '0.85';
                } else {
                    pathDot.style.opacity = '0';
                }
            } catch (err) {
                // Fail-safe
            }
        }
    }

    // ==========================================
    // 12. SKILLS VERTICAL CONNECTOR LINE
    // ==========================================
    function updateSkillsConnector() {
        if (window.innerWidth < 1024) return;
        if (!skillsPath || !skillsGrid) return;
        const rect = skillsGrid.getBoundingClientRect();
        cachedSkillsConnector.absTop = rect.top + (window.scrollY || window.pageYOffset);
        cachedSkillsConnector.height = rect.height;

        const pathLength = skillsPath.getTotalLength();
        cachedSkillsConnector.pathLength = pathLength;
        skillsPath.style.strokeDasharray = pathLength;
        animateSkillsConnector();
    }

    function animateSkillsConnector() {
        if (!skillsGrid || !skillsPath) return;

        const sectionTop = cachedSkillsConnector.absTop - state.currentScroll;
        const sectionHeight = cachedSkillsConnector.height;

        const startScroll = sectionTop - viewportHeight;
        const endScroll = sectionTop + sectionHeight - (viewportHeight * 0.85);

        const totalScrollable = endScroll - startScroll;
        if (totalScrollable <= 0) return;

        let progress = -startScroll / totalScrollable;
        progress = Math.max(0, Math.min(1, progress));

        const pathLength = cachedSkillsConnector.pathLength;
        const offset = pathLength * (1 - progress);

        skillsPath.style.strokeDashoffset = offset;
    }

    // Recalculate layout metrics and connector path on resizing (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cacheLayoutMetrics();
            updateProjectConnector();
            updateSkillsConnector();
            updateCertsTimeline();
        }, 100);
    });

    // Initial path generation after layout settles
    setTimeout(() => {
        cacheLayoutMetrics();
        updateProjectConnector();
        updateSkillsConnector();
        updateCertsTimeline();
    }, 200);

    // ==========================================
    // 13. CUSTOM CURSOR TRACKING & INTERACTIVES
    // ==========================================
    const cursor = document.getElementById('custom-cursor');
    if (cursor && !state.prefersReducedMotion) {
        const mouse = { x: 0, y: 0 };
        const cursorState = { x: 0, y: 0 };
        const cursorEase = 0.15;

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        function updateCursor() {
            cursorState.x = lerp(cursorState.x, mouse.x, cursorEase);
            cursorState.y = lerp(cursorState.y, mouse.y, cursorEase);
            cursor.style.transform = `translate3d(calc(${cursorState.x}px - 50%), calc(${cursorState.y}px - 50%), 0)`;
            requestAnimationFrame(updateCursor);
        }
        requestAnimationFrame(updateCursor);

        // High-performance event delegation for custom cursor hover classes
        const interactiveSelectors = 'a, button, .editorial-social-icon-btn, .project-card, .btn, [role="button"], input, textarea, select';
        
        document.body.addEventListener('mouseover', (e) => {
            if (e.target && typeof e.target.closest === 'function' && e.target.closest(interactiveSelectors)) {
                cursor.classList.add('custom-cursor--hover');
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            if (!e.target || typeof e.target.closest !== 'function' || !e.target.closest(interactiveSelectors)) {
                return;
            }
            if (!e.relatedTarget || typeof e.relatedTarget.closest !== 'function' || !e.relatedTarget.closest(interactiveSelectors)) {
                cursor.classList.remove('custom-cursor--hover');
            }
        });
    }
});
