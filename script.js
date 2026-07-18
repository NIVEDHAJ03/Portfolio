document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     GLOBAL CONTEXT & STATE
     ========================================================================== */
  const body = document.body;

  /* ==========================================================================
     PAGE LOADER
     ========================================================================== */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 600);
    }
  });

  /* ==========================================================================
     CUSTOM INTERACTIVE CANVAS PARTICLES
     ========================================================================== */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let mouse = { x: null, y: null, radius: 120 };

    // Handle mouse movement coordinates
    window.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Resize canvas
    function setCanvasSize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }
    window.addEventListener('resize', setCanvasSize);

    // Particle construction
    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        // Particle mouse push-back logic
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxForce = 5;
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Move particles away from the cursor
            this.x -= forceDirectionX * force * maxForce;
            this.y -= forceDirectionY * force * maxForce;
          }
        }

        // Natural movement
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    // Initialize particles based on screen width
    function initParticles() {
      particlesArray = [];
      let numberOfParticles = Math.floor((canvas.width * canvas.height) / 18000);
      
      // Cap number of particles to ensure solid performance
      if (numberOfParticles > 90) numberOfParticles = 90;
      if (numberOfParticles < 20) numberOfParticles = 20;

      const particleColor = body.classList.contains('light-mode') 
        ? 'rgba(91, 82, 229, 0.2)' 
        : 'rgba(0, 212, 255, 0.2)';

      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1.5;
        let x = (Math.random() * (canvas.width - size * 2) + size * 2);
        let y = (Math.random() * (canvas.height - size * 2) + size * 2);
        let directionX = (Math.random() * 0.8) - 0.4;
        let directionY = (Math.random() * 0.8) - 0.4;

        particlesArray.push(new Particle(x, y, directionX, directionY, size, particleColor));
      }
    }

    // Connect particles with thin transparent lines
    function connectParticles() {
      let opacityValue = 1;
      const lineColor = body.classList.contains('light-mode') ? 91 : 0;
      const lineSecondaryColor = body.classList.contains('light-mode') ? 82 : 212;
      const lineTertiaryColor = body.classList.contains('light-mode') ? 229 : 255;

      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            opacityValue = 1 - (distance / 110);
            ctx.strokeStyle = `rgba(${lineColor}, ${lineSecondaryColor}, ${lineTertiaryColor}, ${opacityValue * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Main animation loop
    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connectParticles();
      requestAnimationFrame(animateParticles);
    }

    // Initialize and run
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    animateParticles();

    // Re-initialize particles color when theme toggles
    document.getElementById('themeToggle').addEventListener('click', () => {
      setTimeout(initParticles, 150); // slight lag to allow variable shifts
    });
  }

  /* ==========================================================================
     DARK / LIGHT MODE TOGGLE
     ========================================================================== */
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('theme');

  // Set initial preference
  if (storedTheme === 'light') {
    body.classList.add('light-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
      } else {
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  /* ==========================================================================
     STICKY NAVBAR & ACTIVE MENU HIGH LIGHTING
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, header');

  window.addEventListener('scroll', () => {
    // Sticky Class
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active Highlight Link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     MOBILE HAMBURGER MENU CONTROLS
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navItems = document.querySelectorAll('.nav-link');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    // Close menu when links are clicked
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================================================
     SCROLL PROGRESS BAR
     ========================================================================== */
  const scrollProgressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (windowScroll / height) * 100;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrolled + '%';
    }
  });

  /* ==========================================================================
     HERO: DYNAMIC TYPING EFFECT
     ========================================================================== */
  const typingElement = document.getElementById('typing');
  if (typingElement) {
    const words = ["Full Stack Developer", "AI Practitioner", "Software Engineer"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 120;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        // Pause at completion
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    }
    type();
  }

  /* ==========================================================================
     SCROLL REVEAL ANIMATIONS (Intersection Observer)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, no need to observe it further
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  /* ==========================================================================
     STATISTICS NUMERICAL INCREMENT COUNTERS
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  const countersObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseInt(target.getAttribute('data-target'));
        const suffix = target.getAttribute('data-suffix') || '';
        let currentCount = 0;
        const speed = targetVal > 50 ? 2.5 : 80; // Speed configuration

        const updateCounter = () => {
          if (currentCount < targetVal) {
            currentCount += Math.ceil(targetVal / (targetVal > 50 ? 40 : 10));
            if (currentCount > targetVal) currentCount = targetVal;
            target.textContent = currentCount + suffix;
            setTimeout(updateCounter, speed);
          } else {
            target.textContent = targetVal + suffix;
          }
        };
        updateCounter();
        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.5
  });

  statNumbers.forEach(number => {
    countersObserver.observe(number);
  });

  /* ==========================================================================
     EXPERIENCE TIMELINE ANIMATIONS
     ========================================================================== */
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.2
  });

  timelineItems.forEach(item => {
    item.classList.add('reveal-up');
    timelineObserver.observe(item);
  });

  /* ==========================================================================
     PORTFOLIO TABS INTERACTION
     ========================================================================== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabIndicator = document.querySelector('.tab-indicator');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function positionIndicator(activeBtn) {
    if (tabIndicator && activeBtn) {
      tabIndicator.style.width = activeBtn.offsetWidth + 'px';
      tabIndicator.style.left = activeBtn.offsetLeft + 'px';
    }
  }

  // Initial indicator layout positioning
  if (tabBtns.length > 0) {
    // Wait for fonts/layout to load to get correct widths
    window.addEventListener('load', () => positionIndicator(tabBtns[0]));
    positionIndicator(tabBtns[0]);
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      positionIndicator(btn);

      const targetTab = btn.getAttribute('data-tab');

      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.getAttribute('id') === `${targetTab}-tab`) {
          pane.classList.add('active');
        }
      });

      // Special check: if target tab is Skills, trigger skill progress width loads
      if (targetTab === 'skills') {
        loadSkillBars();
      }
    });
  });

  // Dynamic window resize adjustment for tab indicator layout
  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) positionIndicator(activeBtn);
  });

  /* ==========================================================================
     SKILLS PROGRESS LOADING
     ========================================================================== */
  function loadSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-inner');
    skillBars.forEach(bar => {
      const level = bar.getAttribute('data-level');
      bar.style.width = level;
    });
  }

  // Skills Observer in case users scroll to skills tab pane before clicking
  const skillsPane = document.getElementById('skills-tab');
  if (skillsPane) {
    const skillsObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.target.classList.contains('active')) {
          loadSkillBars();
        }
      });
    });
    skillsObserver.observe(skillsPane, { attributes: true, attributeFilter: ['class'] });
  }

  /* ==========================================================================
     RIPPLE EFFECTS FOR CTA BUTTONS
     ========================================================================== */
  const rippleButtons = document.querySelectorAll('.ripple-btn, .submit-btn');
  rippleButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      
      const ripples = document.createElement('span');
      ripples.classList.add('ripple');
      ripples.style.left = x + 'px';
      ripples.style.top = y + 'px';
      
      this.appendChild(ripples);
      
      setTimeout(() => {
        ripples.remove();
      }, 600);
    });
  });

  /* ==========================================================================
     CUSTOM MOUSE LAG CURSOR POSITIONER
     ========================================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');

  if (cursorDot && cursorOutline) {
    let dotX = 0, dotY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top = dotY + 'px';
    });

    // Frame Interpolation (lerp) loop for trailing outline smoothness
    function animateCursor() {
      const speed = 0.15; // smoothness factor
      outlineX += (dotX - outlineX) * speed;
      outlineY += (dotY - outlineY) * speed;

      cursorOutline.style.left = outlineX + 'px';
      cursorOutline.style.top = outlineY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover Scaling bindings
    const hoverables = document.querySelectorAll('a, button, .social-icon, .project-card, .tab-btn, .contact-detail-card');
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        body.classList.add('cursor-hover');
      });
      item.addEventListener('mouseleave', () => {
        body.classList.remove('cursor-hover');
      });
    });
  }

  /* ==========================================================================
     BACK TO TOP BUTTON CONTROLS
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================================================
     CONTACT FORM FIELD VALIDATION & SUCCESS WINDOWS
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const formName = document.getElementById('formName');
  const formEmail = document.getElementById('formEmail');
  const formSubject = document.getElementById('formSubject');
  const formMessage = document.getElementById('formMessage');

  const successPopup = document.getElementById('successPopup');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');

  // Input listeners to clear invalid triggers on keypress
  const inputsList = [formName, formEmail, formSubject, formMessage];
  inputsList.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('invalid');
      });
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      if (formName && formName.value.trim() === '') {
        formName.classList.add('invalid');
        isValid = false;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formEmail && !emailRegex.test(formEmail.value.trim())) {
        formEmail.classList.add('invalid');
        isValid = false;
      }

      // Validate Subject
      if (formSubject && formSubject.value.trim() === '') {
        formSubject.classList.add('invalid');
        isValid = false;
      }

      // Validate Message
      if (formMessage && formMessage.value.trim() === '') {
        formMessage.classList.add('invalid');
        isValid = false;
      }

      // If valid, submit form
      if (isValid) {
        // Trigger Success Popup
        if (successPopup) {
          successPopup.classList.add('active');
        }
        contactForm.reset();
      }
    });
  }

  // Close Success Popup
  if (closeSuccessBtn && successPopup) {
    closeSuccessBtn.addEventListener('click', () => {
      successPopup.classList.remove('active');
    });
    
    // Close on overlay clicking
    successPopup.addEventListener('click', (e) => {
      if (e.target === successPopup) {
        successPopup.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     RESUME DOWNLOAD ACTIONS
     ========================================================================== */
  const resumeBtn = document.getElementById('downloadResume');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Generate a mock download action for user
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', 'Nivedha_J_Resume.pdf');
      document.body.appendChild(link);
      alert('Downloading Nivedha J\'s Resume Mock PDF...');
      document.body.removeChild(link);
    });
  }

});

/* ==========================================================================
   ACHIEVEMENT POPUP DETAILS MODAL CONTROLLERS (GLOBAL ACCESSIBILITY)
   ========================================================================== */
const achievementModal = document.getElementById('achievementModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalCloseBtn = document.getElementById('modalCloseBtn');

window.openModal = function(title, text) {
  if (achievementModal && modalTitle && modalContent) {
    modalTitle.textContent = title;
    modalContent.innerHTML = `<p>${text}</p>`;
    achievementModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent back scroll
  }
};

function closeModal() {
  if (achievementModal) {
    achievementModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeModal);
}

if (achievementModal) {
  achievementModal.addEventListener('click', (e) => {
    if (e.target === achievementModal) {
      closeModal();
    }
  });
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
