document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    
    body.classList.add(savedTheme);
    
    themeToggle?.addEventListener('click', () => {
        const isLight = body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark-mode' : 'light-mode';
        body.classList.replace(isLight ? 'light-mode' : 'dark-mode', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const messageField = document.getElementById('message');
    const characterCounter = document.querySelector('.character-counter');
    const MAX_MESSAGE_LENGTH = 1000;
    
    if (messageField && characterCounter) {
        messageField.addEventListener('input', () => {
            const length = messageField.value.length;
            characterCounter.textContent = `${length}/${MAX_MESSAGE_LENGTH}`;
            characterCounter.style.color = length > 950 ? '#ef4444' : length > 800 ? '#f59e0b' : '';
        });
    }
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormStatus();
        clearAllErrors();
        
        if (!validateForm()) return;
        
        setLoadingState(true);
        
        try {
            const formData = new FormData(contactForm);
            formData.append('_replyto', formData.get('email'));
            
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                showSuccessMessage();
                contactForm.reset();
                if (characterCounter) {
                    characterCounter.textContent = `0/${MAX_MESSAGE_LENGTH}`;
                    characterCounter.style.color = '';
                }
            } else {
                const data = await response.json();
                showErrorMessage(data.errors 
                    ? 'Please check your form data and try again.'
                    : 'Something went wrong. Please try again or contact me directly at me@ronenlaz.com'
                );
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setLoadingState(false);
        }
    });
    function validateForm() {
        const fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            message: document.getElementById('message')
        };
        
        if (!fields.name || !fields.email || !fields.message) {
            console.error('Required form fields not found');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validations = [
            { field: 'name', value: fields.name.value.trim(), check: v => !v, msg: 'Name is required' },
            { field: 'email', value: fields.email.value.trim(), check: v => !v, msg: 'Email is required' },
            { field: 'email', value: fields.email.value.trim(), check: v => v && !emailRegex.test(v), msg: 'Please enter a valid email address' },
            { field: 'message', value: fields.message.value.trim(), check: v => !v, msg: 'Message is required' },
            { field: 'message', value: fields.message.value.trim(), check: v => v.length > MAX_MESSAGE_LENGTH, msg: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` }
        ];
        
        let isValid = true;
        for (const { field, value, check, msg } of validations) {
            if (check(value)) {
                showFieldError(field, msg);
                isValid = false;
                break;
            }
        }
        
        return isValid;
    }
    function showFieldError(fieldName, message) {
        const el = document.getElementById(`${fieldName}-error`);
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    }
    
    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }
    const SUBMIT_BTN_DEFAULT = `
        <span class="btn-text">Send Message</span>
        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m22 2-7 20-4-9-9-4z"/>
            <path d="M22 2 11 13"/>
        </svg>`;
    
    const SUBMIT_BTN_LOADING = `
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span>Sending...</span>`;
    
    function setLoadingState(loading) {
        if (!submitBtn) return;
        submitBtn.disabled = loading;
        submitBtn.innerHTML = loading ? SUBMIT_BTN_LOADING : SUBMIT_BTN_DEFAULT;
    }
    function showFormMessage(type, message, duration) {
        if (!formStatus) return;
        
        const icons = {
            success: '<path d="M20 6L9 17l-5-5"/>',
            error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
        };
        
        formStatus.innerHTML = `
            <div class="${type}-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[type]}
                </svg>
                <span>${message}</span>
            </div>`;
        formStatus.style.display = 'block';
        setTimeout(clearFormStatus, duration);
    }
    
    function showSuccessMessage() {
        showFormMessage('success', "Message sent successfully! I'll get back to you soon.", 5000);
    }
    
    function showErrorMessage(message) {
        showFormMessage('error', message, 8000);
    }
    
    function clearFormStatus() {
        if (!formStatus) return;
        formStatus.innerHTML = '';
        formStatus.style.display = 'none';
    }

    // Projects Carousel with Improved Mobile Support
    const projectsGrid = document.querySelector('.projects-grid');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    const progressBar = document.querySelector('.carousel-progress-bar');
    const swipeHint = document.querySelector('.swipe-hint');
    
    if (projectsGrid && dotsContainer) {
        const originalItems = Array.from(projectsGrid.querySelectorAll('.project-item'));
        const totalProjects = originalItems.length;
        
        if (totalProjects === 0) return;
        
        // Carousel state
        const AUTOPLAY_DURATION = 5000;
        const PROGRESS_STEP = 50;
        const ANIMATION_DURATION = 350;
        const SWIPE_THRESHOLD = 50;
        const SWIPE_VELOCITY_THRESHOLD = 0.3;
        
        let currentIndex = 0;
        let progressInterval = null;
        let progress = 0;
        let isPaused = false;
        let isAnimating = false;
        let isUserInteracting = false;
        
        // Check if we're on a touch device
        const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Check if we're on mobile (narrow screen)
        const isMobile = () => window.innerWidth <= 768;
        
        // Clone items for infinite scroll
        for (let i = totalProjects - 1; i >= 0; i--) {
            const clone = originalItems[i].cloneNode(true);
            clone.classList.add('clone');
            clone.setAttribute('aria-hidden', 'true');
            clone.removeAttribute('id');
            projectsGrid.insertBefore(clone, projectsGrid.firstChild);
        }
        
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone');
            clone.setAttribute('aria-hidden', 'true');
            clone.removeAttribute('id');
            projectsGrid.appendChild(clone);
        });
        
        const allItems = Array.from(projectsGrid.querySelectorAll('.project-item'));
        
        // Create navigation dots
        originalItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to project ${index + 1}`);
            dot.addEventListener('click', () => {
                if (!isAnimating) {
                    goToSlide(index);
                    resetAutoplay();
                }
            });
            dotsContainer.appendChild(dot);
        });
        
        const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
        
        // Get the scroll position to center a specific original item
        function getScrollPosition(index) {
            const actualIndex = index + totalProjects;
            const item = allItems[actualIndex];
            if (!item) return 0;
            
            const gridWidth = projectsGrid.offsetWidth;
            const itemWidth = item.offsetWidth;
            const itemLeft = item.offsetLeft;
            
            // Center the item
            return itemLeft - (gridWidth - itemWidth) / 2;
        }
        
        // Update which dot is active
        function updateDots(index) {
            const normalizedIndex = ((index % totalProjects) + totalProjects) % totalProjects;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === normalizedIndex);
                dot.setAttribute('aria-current', i === normalizedIndex ? 'true' : 'false');
            });
        }
        
        // Detect which item is currently centered
        function getCurrentCenteredIndex() {
            const gridRect = projectsGrid.getBoundingClientRect();
            const centerX = gridRect.left + gridRect.width / 2;
            
            let closestIndex = totalProjects;
            let minDistance = Infinity;
            
            allItems.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2;
                const distance = Math.abs(centerX - itemCenterX);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });
            
            return closestIndex;
        }
        
        // Smooth scroll with requestAnimationFrame for better mobile performance
        function smoothScrollTo(targetScroll, duration = ANIMATION_DURATION) {
            const startScroll = projectsGrid.scrollLeft;
            const distance = targetScroll - startScroll;
            const startTime = performance.now();
            
            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }
            
            function animateScroll(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                projectsGrid.scrollLeft = startScroll + distance * easeOutCubic(progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    isAnimating = false;
                    checkInfiniteLoop();
                }
            }
            
            isAnimating = true;
            requestAnimationFrame(animateScroll);
        }
        
        // Check and handle infinite loop jump
        function checkInfiniteLoop() {
            const centeredIndex = getCurrentCenteredIndex();
            const isOnCloneBefore = centeredIndex < totalProjects;
            const isOnCloneAfter = centeredIndex >= totalProjects * 2;
            
            if (isOnCloneBefore || isOnCloneAfter) {
                const originalIndex = ((centeredIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
                projectsGrid.style.scrollBehavior = 'auto';
                projectsGrid.scrollLeft = getScrollPosition(originalIndex);
                currentIndex = originalIndex;
            }
        }
        
        // Go to a specific slide
        function goToSlide(index, animate = true) {
            if (isAnimating) return;
            
            currentIndex = ((index % totalProjects) + totalProjects) % totalProjects;
            const scrollPos = getScrollPosition(currentIndex);
            
            updateDots(currentIndex);
            
            if (animate) {
                smoothScrollTo(scrollPos);
            } else {
                projectsGrid.style.scrollBehavior = 'auto';
                projectsGrid.scrollLeft = scrollPos;
            }
        }
        
        // Move to next slide
        function nextSlide() {
            if (isAnimating) return;
            
            const centeredIndex = getCurrentCenteredIndex();
            const targetIndex = centeredIndex + 1;
            const item = allItems[targetIndex];
            
            if (!item) return;
            
            const gridWidth = projectsGrid.offsetWidth;
            const itemWidth = item.offsetWidth;
            const targetScroll = item.offsetLeft - (gridWidth - itemWidth) / 2;
            
            currentIndex = ((targetIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
            updateDots(currentIndex);
            smoothScrollTo(targetScroll);
        }
        
        // Move to previous slide
        function prevSlide() {
            if (isAnimating) return;
            
            const centeredIndex = getCurrentCenteredIndex();
            const targetIndex = centeredIndex - 1;
            const item = allItems[targetIndex];
            
            if (!item) return;
            
            const gridWidth = projectsGrid.offsetWidth;
            const itemWidth = item.offsetWidth;
            const targetScroll = item.offsetLeft - (gridWidth - itemWidth) / 2;
            
            currentIndex = ((targetIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
            updateDots(currentIndex);
            smoothScrollTo(targetScroll);
        }
        
        // Snap to the nearest slide
        function snapToNearestSlide() {
            if (isAnimating) return;
            
            const centeredIndex = getCurrentCenteredIndex();
            const item = allItems[centeredIndex];
            
            if (!item) return;
            
            const gridWidth = projectsGrid.offsetWidth;
            const itemWidth = item.offsetWidth;
            const targetScroll = item.offsetLeft - (gridWidth - itemWidth) / 2;
            
            currentIndex = ((centeredIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
            updateDots(currentIndex);
            smoothScrollTo(targetScroll, 200);
        }
        
        // Autoplay functions
        function updateProgress() {
            if (isPaused || isAnimating || isUserInteracting) return;
            
            progress += (PROGRESS_STEP / AUTOPLAY_DURATION) * 100;
            if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
            
            if (progress >= 100) {
                progress = 0;
                nextSlide();
            }
        }
        
        function stopAutoplay() {
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
        }
        
        function startAutoplay() {
            stopAutoplay();
            if (isPaused) return;
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';
            progressInterval = setInterval(updateProgress, PROGRESS_STEP);
        }
        
        function resetAutoplay() {
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';
            startAutoplay();
        }
        
        function pauseAutoplay() {
            isPaused = true;
            stopAutoplay();
            if (progressBar) progressBar.style.opacity = '0.3';
        }
        
        function resumeAutoplay() {
            isPaused = false;
            if (progressBar) progressBar.style.opacity = '1';
            startAutoplay();
        }
        
        // Button click handlers
        prevBtn?.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
        nextBtn?.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
        
        // Touch handling for mobile with improved gesture detection
        let touchState = {
            startX: 0,
            startY: 0,
            startTime: 0,
            startScrollLeft: 0,
            isDragging: false,
            isHorizontal: null,
            velocityX: 0,
            lastX: 0,
            lastTime: 0
        };
        
        projectsGrid.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchState = {
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: performance.now(),
                startScrollLeft: projectsGrid.scrollLeft,
                isDragging: true,
                isHorizontal: null,
                velocityX: 0,
                lastX: touch.clientX,
                lastTime: performance.now()
            };
            
            isUserInteracting = true;
            stopAutoplay();
            
            // Hide swipe hint on first touch
            if (swipeHint) {
                swipeHint.style.opacity = '0';
                setTimeout(() => { if (swipeHint) swipeHint.style.display = 'none'; }, 300);
            }
        }, { passive: true });
        
        projectsGrid.addEventListener('touchmove', (e) => {
            if (!touchState.isDragging) return;
            
            const touch = e.touches[0];
            const diffX = touch.clientX - touchState.startX;
            const diffY = touch.clientY - touchState.startY;
            const currentTime = performance.now();
            
            // Determine swipe direction on first significant movement
            if (touchState.isHorizontal === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
                touchState.isHorizontal = Math.abs(diffX) > Math.abs(diffY);
            }
            
            // Calculate velocity for momentum
            const timeDelta = currentTime - touchState.lastTime;
            if (timeDelta > 0) {
                touchState.velocityX = (touch.clientX - touchState.lastX) / timeDelta;
            }
            touchState.lastX = touch.clientX;
            touchState.lastTime = currentTime;
            
        }, { passive: true });
        
        projectsGrid.addEventListener('touchend', (e) => {
            if (!touchState.isDragging) return;
            
            touchState.isDragging = false;
            isUserInteracting = false;
            
            // On mobile, rely on native scroll-snap - just update dots after scroll settles
            if (isMobile()) {
                setTimeout(() => {
                    const centeredIndex = getCurrentCenteredIndex();
                    const originalIndex = ((centeredIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
                    currentIndex = originalIndex;
                    updateDots(currentIndex);
                    checkInfiniteLoop();
                    
                    // Resume autoplay after a delay
                    setTimeout(() => {
                        if (!isUserInteracting && !isPaused) {
                            startAutoplay();
                        }
                    }, 2000);
                }, 150);
                return;
            }
            
            // Desktop touch behavior
            const touch = e.changedTouches[0];
            const diffX = touch.clientX - touchState.startX;
            const velocity = Math.abs(touchState.velocityX);
            
            // Determine action based on swipe distance and velocity
            if (touchState.isHorizontal) {
                const shouldSwipe = Math.abs(diffX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;
                
                if (shouldSwipe) {
                    if (diffX < 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                } else {
                    // Snap to nearest slide
                    snapToNearestSlide();
                }
            } else {
                // Snap to nearest if it was a vertical scroll or tap
                snapToNearestSlide();
            }
            
            // Resume autoplay after a delay (respects isPaused state)
            setTimeout(() => {
                if (!isUserInteracting && !isPaused) {
                    startAutoplay();
                }
            }, 2000);
        }, { passive: true });
        
        // Handle scroll end for mouse/trackpad users and sync state
        let scrollEndTimer;
        let lastScrollLeft = 0;
        
        projectsGrid.addEventListener('scroll', () => {
            clearTimeout(scrollEndTimer);
            
            // Detect if user is manually scrolling (not from our animation)
            if (!isAnimating) {
                const scrollDiff = Math.abs(projectsGrid.scrollLeft - lastScrollLeft);
                if (scrollDiff > 5) {
                    isUserInteracting = true;
                    stopAutoplay();
                }
            }
            lastScrollLeft = projectsGrid.scrollLeft;
            
            scrollEndTimer = setTimeout(() => {
                if (!isAnimating && !touchState.isDragging) {
                    // Update dots based on current position
                    const centeredIndex = getCurrentCenteredIndex();
                    const originalIndex = ((centeredIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
                    
                    if (currentIndex !== originalIndex) {
                        currentIndex = originalIndex;
                        updateDots(currentIndex);
                    }
                    
                    // On mobile, don't fight with scroll-snap, just handle infinite loop
                    if (isMobile()) {
                        checkInfiniteLoop();
                    } else {
                        // Snap to center and handle infinite loop on desktop
                        snapToNearestSlide();
                    }
                    
                    isUserInteracting = false;
                    
                    // Resume autoplay after scroll ends
                    setTimeout(() => {
                        if (!isPaused && !isUserInteracting) {
                            startAutoplay();
                        }
                    }, 1000);
                }
            }, 150);
        }, { passive: true });
        
        // Mouse drag support for desktop
        let mouseState = { isDragging: false, startX: 0, scrollLeft: 0 };
        
        projectsGrid.addEventListener('mousedown', (e) => {
            if (isTouchDevice()) return;
            mouseState.isDragging = true;
            mouseState.startX = e.pageX - projectsGrid.offsetLeft;
            mouseState.scrollLeft = projectsGrid.scrollLeft;
            projectsGrid.style.cursor = 'grabbing';
            isUserInteracting = true;
            stopAutoplay();
        });
        
        projectsGrid.addEventListener('mouseup', () => {
            if (mouseState.isDragging) {
                mouseState.isDragging = false;
                projectsGrid.style.cursor = 'grab';
                isUserInteracting = false;
                snapToNearestSlide();
                setTimeout(() => {
                    if (!isPaused && !isUserInteracting) {
                        startAutoplay();
                    }
                }, 1000);
            }
        });
        
        projectsGrid.addEventListener('mousemove', (e) => {
            if (!mouseState.isDragging) return;
            e.preventDefault();
            const x = e.pageX - projectsGrid.offsetLeft;
            const walk = (x - mouseState.startX) * 1.5;
            projectsGrid.scrollLeft = mouseState.scrollLeft - walk;
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const projectsSection = document.getElementById('projects');
            if (!projectsSection) return;
            
            const rect = projectsSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !isAnimating) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevSlide();
                    resetAutoplay();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    nextSlide();
                    resetAutoplay();
                }
            }
        });
        
        // Set grab cursor and handle mouse leaving while dragging (desktop only)
        if (!isTouchDevice()) {
            projectsGrid.style.cursor = 'grab';
            
            projectsGrid.addEventListener('mouseleave', () => {
                // Handle dragging end when mouse leaves
                if (mouseState.isDragging) {
                    mouseState.isDragging = false;
                    projectsGrid.style.cursor = 'grab';
                    snapToNearestSlide();
                    isUserInteracting = false;
                    setTimeout(() => {
                        if (!isPaused && !isUserInteracting) {
                            startAutoplay();
                        }
                    }, 500);
                }
            });
        }
        
        // Initialize carousel
        function init() {
            projectsGrid.style.scrollBehavior = 'auto';
            
            // On mobile, just scroll to first item without complex positioning
            if (isMobile()) {
                // Scroll to show the first original item (after clones)
                const firstOriginalItem = allItems[totalProjects];
                if (firstOriginalItem) {
                    projectsGrid.scrollLeft = firstOriginalItem.offsetLeft - 16; // Account for padding
                }
            } else {
                projectsGrid.scrollLeft = getScrollPosition(0);
            }
            
            currentIndex = 0;
            updateDots(0);
            
            // Start autoplay after a brief delay
            setTimeout(startAutoplay, 1000);
        }
        
        // Wait for layout to be ready
        if (document.readyState === 'complete') {
            requestAnimationFrame(() => setTimeout(init, 50));
        } else {
            window.addEventListener('load', () => requestAnimationFrame(() => setTimeout(init, 50)));
        }
        
        // Handle resize - debounced
        let resizeTimer;
        let wasDesktop = !isMobile();
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            stopAutoplay();
            
            resizeTimer = setTimeout(() => {
                const isNowMobile = isMobile();
                const layoutChanged = wasDesktop === isNowMobile;
                wasDesktop = !isNowMobile;
                
                projectsGrid.style.scrollBehavior = 'auto';
                
                if (isNowMobile) {
                    // On mobile, scroll to current item simply
                    const targetItem = allItems[currentIndex + totalProjects];
                    if (targetItem) {
                        projectsGrid.scrollLeft = targetItem.offsetLeft - 16;
                    }
                } else {
                    projectsGrid.scrollLeft = getScrollPosition(currentIndex);
                }
                
                if (!isPaused) {
                    startAutoplay();
                }
            }, 250);
        });
        
        // Pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else if (!isPaused && !isUserInteracting) {
                startAutoplay();
            }
        });
        
        // Intersection observer to pause when not visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!isPaused && !isUserInteracting) {
                        startAutoplay();
                    }
                } else {
                    stopAutoplay();
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(projectsGrid);
    }
});
