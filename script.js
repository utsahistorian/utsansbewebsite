// Enhanced UTSA NSBE Website JavaScript
// Comprehensive functionality with modern ES6+ features and performance optimizations

class UTSANSBEWebsite {
  constructor() {
    this.init()
    this.setupEventListeners()
    this.setupIntersectionObserver()
    this.setupScrollEffects()
  }

  init() {
    this.handleLoadingScreen()
    this.initializeNavbar()
    this.initializeHeroCarousel()
    this.initializeAnimations()
    this.initializeFormHandlers()
    this.initializeAccessibility()
  }

  // Loading Screen Management
  handleLoadingScreen() {
    const loadingScreen = document.querySelector(".loading-screen")
    if (!loadingScreen) return

    const hideLoading = () => {
      setTimeout(() => {
        loadingScreen.classList.add("hidden")
        // Remove from DOM after animation completes
        setTimeout(() => {
          loadingScreen.remove()
        }, 500)
      }, 800)
    }

    if (document.readyState === "complete") {
      hideLoading()
    } else {
      window.addEventListener("load", hideLoading)
    }
  }

  // Enhanced Navbar Functionality
  initializeNavbar() {
    const navbar = document.getElementById("navbar")
    const navToggle = document.querySelector(".nav-toggle")
    const navMenu = document.getElementById("nav-menu")

    if (!navbar) return

    // Scroll effect with throttling
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          navbar.classList.toggle("scrolled", scrollY > 50)

          // Add navbar hide/show on scroll
          if (scrollY > 100) {
            navbar.style.transform = scrollY > this.lastScrollY ? "translateY(-100%)" : "translateY(0)"
          } else {
            navbar.style.transform = "translateY(0)"
          }
          this.lastScrollY = scrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // Enhanced mobile navigation
    if (navToggle && navMenu) {
      navToggle.addEventListener("click", (e) => {
        e.preventDefault()
        this.toggleMobileMenu(navToggle, navMenu)
      })

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
          this.closeMobileMenu(navToggle, navMenu)
        }
      })

      // Close menu on escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navMenu.classList.contains("open")) {
          this.closeMobileMenu(navToggle, navMenu)
        }
      })

      // Close menu when clicking nav links
      navMenu.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          this.closeMobileMenu(navToggle, navMenu)
        })
      })
    }

    // Active link highlighting
    this.updateActiveNavLink()
    window.addEventListener("hashchange", () => this.updateActiveNavLink())
  }

  toggleMobileMenu(toggle, menu) {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true"
    toggle.setAttribute("aria-expanded", !isExpanded)
    menu.classList.toggle("open")
    document.body.classList.toggle("no-scroll", !isExpanded)

    // Add staggered animation to menu items
    if (!isExpanded) {
      const menuItems = menu.querySelectorAll(".nav-link")
      menuItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`
        item.classList.add("animate-slide-up")
      })
    }
  }

  closeMobileMenu(toggle, menu) {
    toggle.setAttribute("aria-expanded", "false")
    menu.classList.remove("open")
    document.body.classList.remove("no-scroll")
  }

  updateActiveNavLink() {
    const currentPath = window.location.pathname
    const navLinks = document.querySelectorAll(".nav-link")

    navLinks.forEach((link) => {
      link.classList.remove("active")
      const href = link.getAttribute("href")
      if (href && (currentPath.includes(href) || (currentPath === "/" && href === "index.html"))) {
        link.classList.add("active")
      }
    })
  }

  // Enhanced Hero Carousel
  initializeHeroCarousel() {
    const heroCarousel = document.getElementById("hero-carousel")
    if (!heroCarousel) return

    const slides = heroCarousel.querySelectorAll(".hero-slide")
    const indicators = heroCarousel.querySelectorAll(".indicator")
    const prevBtn = heroCarousel.querySelector(".prev")
    const nextBtn = heroCarousel.querySelector(".next")
    const progressBar = heroCarousel.querySelector(".progress-bar")

    if (slides.length === 0) return

    let currentSlide = 0
    let interval
    let isPlaying = true
    const slideDuration = 6000
    let startTime

    const showSlide = (index, direction = "next") => {
      // Remove active class from all slides
      slides.forEach((slide, i) => {
        slide.classList.remove("active", "slide-in-left", "slide-in-right")
        if (i === index) {
          slide.classList.add("active")
          // Add entrance animation based on direction
          slide.classList.add(direction === "next" ? "slide-in-right" : "slide-in-left")
        }
      })

      // Update indicators
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle("active", i === index)
      })

      this.resetProgressBar()
    }

    const nextSlide = () => {
      const prevIndex = currentSlide
      currentSlide = (currentSlide + 1) % slides.length
      showSlide(currentSlide, "next")
      this.announceSlideChange(currentSlide, slides.length)
    }

    const prevSlide = () => {
      const prevIndex = currentSlide
      currentSlide = (currentSlide - 1 + slides.length) % slides.length
      showSlide(currentSlide, "prev")
      this.announceSlideChange(currentSlide, slides.length)
    }

    const startCarousel = () => {
      if (!isPlaying) return
      clearInterval(interval)
      interval = setInterval(nextSlide, slideDuration)
      this.startProgressBar()
    }

    const pauseCarousel = () => {
      clearInterval(interval)
      isPlaying = false
    }

    const resumeCarousel = () => {
      isPlaying = true
      startCarousel()
    }

    // Event listeners
    nextBtn?.addEventListener("click", () => {
      nextSlide()
      pauseCarousel()
      setTimeout(resumeCarousel, 3000) // Resume after 3 seconds
    })

    prevBtn?.addEventListener("click", () => {
      prevSlide()
      pauseCarousel()
      setTimeout(resumeCarousel, 3000)
    })

    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        if (index !== currentSlide) {
          const direction = index > currentSlide ? "next" : "prev"
          currentSlide = index
          showSlide(currentSlide, direction)
          pauseCarousel()
          setTimeout(resumeCarousel, 3000)
        }
      })
    })

    // Keyboard navigation
    heroCarousel.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          prevSlide()
          break
        case "ArrowRight":
          e.preventDefault()
          nextSlide()
          break
        case " ":
          e.preventDefault()
          isPlaying ? pauseCarousel() : resumeCarousel()
          break
      }
    })

    // Pause on hover
    heroCarousel.addEventListener("mouseenter", pauseCarousel)
    heroCarousel.addEventListener("mouseleave", resumeCarousel)

    // Touch/swipe support
    this.addSwipeSupport(heroCarousel, nextSlide, prevSlide)

    // Initialize
    showSlide(currentSlide)
    startCarousel()

    // Store reference for cleanup
    this.carouselCleanup = () => clearInterval(interval)
  }

  resetProgressBar() {
    const progressBar = document.querySelector(".progress-bar")
    if (!progressBar) return

    progressBar.style.width = "0%"
    void progressBar.offsetWidth // Trigger reflow
    this.startProgressBar()
  }

  startProgressBar() {
    const progressBar = document.querySelector(".progress-bar")
    if (!progressBar) return

    const startTime = Date.now()
    const duration = 6000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      progressBar.style.width = `${progress}%`

      if (progress < 100) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  announceSlideChange(current, total) {
    // For screen readers
    const announcement = `Slide ${current + 1} of ${total}`
    const announcer = document.getElementById("slide-announcer") || this.createAnnouncer()
    announcer.textContent = announcement
  }

  createAnnouncer() {
    const announcer = document.createElement("div")
    announcer.id = "slide-announcer"
    announcer.className = "sr-only"
    announcer.setAttribute("aria-live", "polite")
    document.body.appendChild(announcer)
    return announcer
  }

  // Touch/Swipe Support
  addSwipeSupport(element, nextCallback, prevCallback) {
    let startX = 0
    let startY = 0
    let distX = 0
    let distY = 0
    const threshold = 100
    const restraint = 100

    element.addEventListener(
      "touchstart",
      (e) => {
        const touchobj = e.changedTouches[0]
        startX = touchobj.pageX
        startY = touchobj.pageY
      },
      { passive: true },
    )

    element.addEventListener(
      "touchend",
      (e) => {
        const touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX
        distY = touchobj.pageY - startY

        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          if (distX > 0) {
            prevCallback()
          } else {
            nextCallback()
          }
        }
      },
      { passive: true },
    )
  }

  // Enhanced Animations with Intersection Observer
  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: "-10% 0px -10% 0px",
      threshold: [0.1, 0.3, 0.5, 0.7],
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target
          const animationClass = element.dataset.animation || "animate-in"
          const delay = element.dataset.delay || "0"

          setTimeout(() => {
            element.classList.add(animationClass)

            // Special handling for different element types
            if (element.classList.contains("stat-card")) {
              this.animateStatNumbers(element)
            }

            if (element.classList.contains("leadership-grid")) {
              this.animateLeadershipCards(element)
            }

            if (element.classList.contains("timeline-item")) {
              this.animateTimelineItem(element)
            }
          }, Number.parseInt(delay))

          // Stop observing once animated
          this.observer.unobserve(element)
        }
      })
    }

    this.observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe elements
    const elementsToObserve = document.querySelectorAll(`
      .mission-section, .features, .cta, .contact-section, 
      .conference-list-section, .map-section, .stat-card,
      .leader-card, .timeline-item, .gallery-item,
      .futuristic-card, .social-platform
    `)

    elementsToObserve.forEach((el, index) => {
      el.dataset.delay = (index * 100).toString()
      this.observer.observe(el)
    })
  }

  // Enhanced Stat Counter Animation
  animateStatNumbers(container) {
    const statNumbers = container.querySelectorAll(".stat-number[data-count]")

    statNumbers.forEach((stat) => {
      const target = Number.parseInt(stat.dataset.count)
      const duration = 2000
      const increment = target / (duration / 16) // 60fps
      let current = 0

      const updateCount = () => {
        if (current < target) {
          current += increment
          stat.textContent = Math.floor(current)
          requestAnimationFrame(updateCount)
        } else {
          stat.textContent = target
          // Add completion effect
          stat.style.transform = "scale(1.1)"
          setTimeout(() => {
            stat.style.transform = "scale(1)"
          }, 200)
        }
      }

      updateCount()
    })
  }

  // Leadership Cards Animation
  animateLeadershipCards(container) {
    const cards = container.querySelectorAll(".leader-card")
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate-scale")
      }, index * 150)
    })
  }

  // Timeline Animation
  animateTimelineItem(item) {
    const year = item.querySelector(".timeline-year")
    const content = item.querySelector("h3, p")

    if (year) {
      year.style.transform = "translateX(-50px)"
      year.style.opacity = "0"
      setTimeout(() => {
        year.style.transition = "all 0.6s ease"
        year.style.transform = "translateX(0)"
        year.style.opacity = "1"
      }, 100)
    }

    if (content) {
      setTimeout(() => {
        content.classList.add("animate-left")
      }, 300)
    }
  }

  // Scroll Effects
  setupScrollEffects() {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollProgress()
          this.handleParallaxEffects()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
  }

  updateScrollProgress() {
    const scrollProgress = document.querySelector(".scroll-progress")
    if (scrollProgress) {
      const scrollTop = window.pageYOffset
      const docHeight = document.body.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      scrollProgress.style.width = `${scrollPercent}%`
    }
  }

  handleParallaxEffects() {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll(".parallax")

    parallaxElements.forEach((element) => {
      const speed = element.dataset.speed || 0.5
      const yPos = -(scrolled * speed)
      element.style.transform = `translateY(${yPos}px)`
    })
  }

  // Form Handling
  initializeFormHandlers() {
    // Contact Form
    const contactForm = document.querySelector(".contact-form")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => this.handleContactForm(e))

      // Real-time validation
      const inputs = contactForm.querySelectorAll("input, textarea")
      inputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateField(input))
        input.addEventListener("input", () => this.clearFieldError(input))
      })
    }

    // Newsletter forms
    const newsletterForms = document.querySelectorAll(".newsletter-form")
    newsletterForms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleNewsletterForm(e))
    })
  }

  handleContactForm(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const data = Object.fromEntries(formData)

    // Validate form
    if (!this.validateContactForm(data)) {
      return
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Sending..."
    submitBtn.disabled = true

    // Create mailto link (fallback method)
    const mailtoLink = this.createMailtoLink(data)

    // Simulate form submission
    setTimeout(() => {
      window.location.href = mailtoLink

      // Show success message
      this.showNotification("Message prepared! Please send via your email client.", "success")

      // Reset form
      form.reset()
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }, 1000)
  }

  validateContactForm(data) {
    let isValid = true
    const errors = {}

    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long"
      isValid = false
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }

    if (!data.subject || data.subject.trim().length < 5) {
      errors.subject = "Subject must be at least 5 characters long"
      isValid = false
    }

    if (!data.message || data.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters long"
      isValid = false
    }

    // Display errors
    Object.keys(errors).forEach((field) => {
      this.showFieldError(field, errors[field])
    })

    return isValid
  }

  validateField(input) {
    const value = input.value.trim()
    const name = input.name
    let error = ""

    switch (name) {
      case "name":
        if (value.length < 2) error = "Name must be at least 2 characters long"
        break
      case "email":
        if (!this.isValidEmail(value)) error = "Please enter a valid email address"
        break
      case "subject":
        if (value.length < 5) error = "Subject must be at least 5 characters long"
        break
      case "message":
        if (value.length < 10) error = "Message must be at least 10 characters long"
        break
    }

    if (error) {
      this.showFieldError(name, error)
    } else {
      this.clearFieldError(input)
    }
  }

  showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`)
    if (!field) return

    field.classList.add("error")

    let errorElement = field.parentNode.querySelector(".field-error")
    if (!errorElement) {
      errorElement = document.createElement("div")
      errorElement.className = "field-error"
      field.parentNode.appendChild(errorElement)
    }

    errorElement.textContent = message
  }

  clearFieldError(input) {
    input.classList.remove("error")
    const errorElement = input.parentNode.querySelector(".field-error")
    if (errorElement) {
      errorElement.remove()
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  createMailtoLink(data) {
    const recipientEmail = "utsansbe@gmail.com"
    const subject = encodeURIComponent(`UTSA NSBE Website: ${data.subject}`)
    const body = encodeURIComponent(`Name: ${data.name}\n` + `Email: ${data.email}\n\n` + `Message:\n${data.message}`)

    return `mailto:${recipientEmail}?subject=${subject}&body=${body}`
  }

  // Notification System
  showNotification(message, type = "info", duration = 5000) {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Close notification">&times;</button>
      </div>
    `

    // Add to page
    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => notification.classList.add("show"), 100)

    // Auto remove
    const removeNotification = () => {
      notification.classList.remove("show")
      setTimeout(() => notification.remove(), 300)
    }

    setTimeout(removeNotification, duration)

    // Manual close
    notification.querySelector(".notification-close").addEventListener("click", removeNotification)
  }

  // Accessibility Enhancements
  initializeAccessibility() {
    // Skip to content link
    this.addSkipLink()

    // Keyboard navigation for carousels
    this.enhanceKeyboardNavigation()

    // Focus management for modals/menus
    this.setupFocusManagement()

    // Announce dynamic content changes
    this.setupAriaLiveRegions()
  }

  addSkipLink() {
    if (document.querySelector(".skip-link")) return

    const skipLink = document.createElement("a")
    skipLink.href = "#main-content"
    skipLink.className = "skip-link"
    skipLink.textContent = "Skip to main content"

    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  enhanceKeyboardNavigation() {
    // Add keyboard support to interactive elements
    const interactiveElements = document.querySelectorAll(".futuristic-card, .stat-card, .leader-card")

    interactiveElements.forEach((element) => {
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "0")
      }

      element.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          element.click()
        }
      })
    })
  }

  setupFocusManagement() {
    // Store focus when opening mobile menu
    const navToggle = document.querySelector(".nav-toggle")
    const navMenu = document.querySelector(".nav-menu")

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        if (navMenu.classList.contains("open")) {
          // Focus first menu item when opening
          setTimeout(() => {
            const firstLink = navMenu.querySelector(".nav-link")
            if (firstLink) firstLink.focus()
          }, 100)
        }
      })
    }
  }

  setupAriaLiveRegions() {
    // Create live region for announcements
    if (!document.getElementById("aria-live-region")) {
      const liveRegion = document.createElement("div")
      liveRegion.id = "aria-live-region"
      liveRegion.className = "sr-only"
      liveRegion.setAttribute("aria-live", "polite")
      liveRegion.setAttribute("aria-atomic", "true")
      document.body.appendChild(liveRegion)
    }
  }

  announce(message) {
    const liveRegion = document.getElementById("aria-live-region")
    if (liveRegion) {
      liveRegion.textContent = message
    }
  }

  // Event Listeners Setup
  setupEventListeners() {
    // Smooth scrolling for anchor links
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (link) {
        e.preventDefault()
        const targetId = link.getAttribute("href").substring(1)
        const targetElement = document.getElementById(targetId)

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })

          // Update URL without jumping
          history.pushState(null, null, `#${targetId}`)
        }
      }
    })

    // Enhanced button interactions
    document.addEventListener("click", (e) => {
      const button = e.target.closest(".btn, .futuristic-btn")
      if (button && !button.disabled) {
        this.addButtonRippleEffect(button, e)
      }
    })

    // Lazy loading for images
    this.setupLazyLoading()

    // Performance monitoring
    this.setupPerformanceMonitoring()
  }

  addButtonRippleEffect(button, event) {
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `

    button.style.position = "relative"
    button.style.overflow = "hidden"
    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }

  setupLazyLoading() {
    const images = document.querySelectorAll("img[data-src]")

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.classList.remove("lazy")
            imageObserver.unobserve(img)
          }
        })
      })

      images.forEach((img) => imageObserver.observe(img))
    } else {
      // Fallback for older browsers
      images.forEach((img) => {
        img.src = img.dataset.src
      })
    }
  }

  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener("load", () => {
      if ("performance" in window) {
        const perfData = performance.getEntriesByType("navigation")[0]
        console.log("Page Load Time:", perfData.loadEventEnd - perfData.loadEventStart, "ms")
      }
    })
  }

  // Cleanup method
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }

    if (this.carouselCleanup) {
      this.carouselCleanup()
    }

    // Remove event listeners
    window.removeEventListener("scroll", this.handleScroll)
    window.removeEventListener("resize", this.handleResize)
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.utsaNsbeWebsite = new UTSANSBEWebsite()
})

// Add CSS for notifications and ripple effect
const additionalStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-glass);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
    backdrop-filter: blur(10px);
    padding: 1rem;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10000;
  }
  
  .notification.show {
    transform: translateX(0);
  }
  
  .notification-success {
    border-left: 4px solid #22c55e;
  }
  
  .notification-error {
    border-left: 4px solid #ef4444;
  }
  
  .notification-info {
    border-left: 4px solid var(--primary-orange);
  }
  
  .notification-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .field-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .form-group input.error,
  .form-group textarea.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .slide-in-left {
    animation: slideInLeft 0.8s ease-out;
  }
  
  .slide-in-right {
    animation: slideInRight 0.8s ease-out;
  }
  
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`

// Inject additional styles
const styleSheet = document.createElement("style")
styleSheet.textContent = additionalStyles
document.head.appendChild(styleSheet)
