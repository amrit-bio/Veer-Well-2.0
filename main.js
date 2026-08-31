import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.0/+esm";

(async () => {
  // ============================================================================
  // Mobile Menu Toggle
  // ============================================================================
  const burger = document.querySelector(".nav__burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuLinks = document.querySelectorAll(".mobile-menu__link");

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", !isOpen);

      if (isOpen) {
        mobileMenu.setAttribute("hidden", "");
      } else {
        mobileMenu.removeAttribute("hidden");
      }
    });

    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("hidden", "");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        burger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("hidden", "");
      }
    });
  }

  // ============================================================================
  // Respect prefers-reduced-motion
  // ============================================================================
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    // Disable all Motion animations
    return;
  }

  // ============================================================================
  // Navigation Links Animation
  // ============================================================================
  const navLinks = document.querySelectorAll(".nav__links li");
  if (navLinks.length) {
    navLinks.forEach((link, index) => {
      animate(
        link,
        { opacity: [0, 1], y: [10, 0] },
        {
          duration: 0.55,
          delay: 0.02 + index * 0.06,
          easing: [0.16, 1, 0.3, 1],
        }
      );
    });
  }

  // ============================================================================
  // Logo Bands Animation
  // ============================================================================
  const logoBands = document.querySelectorAll(".logo-band");
  if (logoBands.length) {
    logoBands.forEach((band, index) => {
      animate(
        band,
        { opacity: [0, 1], y: [10, 0] },
        {
          duration: 0.5,
          delay: 0.04 + index * 0.05,
          easing: [0.16, 1, 0.3, 1],
        }
      );
    });
  }

  // ============================================================================
  // Nav Button Animation (wipe from left to right)
  // ============================================================================
  const navBtn = document.querySelector(".btn--nav");
  if (navBtn) {
    animate(
      navBtn,
      {
        opacity: [0, 1],
        x: [-20, 0],
      },
      {
        duration: 0.65,
        delay: 0.16,
        easing: [0.16, 1, 0.3, 1],
      }
    );
  }

  // ============================================================================
  // Burger Menu Button Animation
  // ============================================================================
  if (burger) {
    animate(
      burger,
      {
        opacity: [0, 1],
        x: [20, 0],
      },
      {
        duration: 0.5,
        delay: 0.16,
        easing: [0.16, 1, 0.3, 1],
      }
    );
  }

  // ============================================================================
  // Badge Animation
  // ============================================================================
  const badge = document.querySelector(".badge");
  if (badge) {
    animate(
      badge,
      {
        opacity: [0, 1],
        x: [-100, 0],
      },
      {
        duration: 0.7,
        delay: 0.18,
        easing: [0.16, 1, 0.3, 1],
      }
    );
  }

  // ============================================================================
  // Headline Masks Animation
  // ============================================================================
  const headlineMasks = document.querySelectorAll(".headline__mask");
  if (headlineMasks.length) {
    const delays = [0.26, 0.4];
    headlineMasks.forEach((mask, index) => {
      const rise = mask.querySelector(".headline__rise");
      if (rise) {
        animate(
          rise,
          {
            y: ["118%", "0%"],
            opacity: [0, 1],
          },
          {
            duration: 0.85,
            delay: delays[index],
            easing: [0.16, 1, 0.3, 1],
          }
        );
      }
    });
  }

  // ============================================================================
  // Action Buttons Animation
  // ============================================================================
  const actionButtons = document.querySelectorAll(".actions .btn");
  if (actionButtons.length) {
    const btnDelays = [0.56, 0.66];
    actionButtons.forEach((btn, index) => {
      animate(
        btn,
        {
          opacity: [0, 1],
          x: [100, 0],
        },
        {
          duration: 0.7,
          delay: btnDelays[index],
          easing: [0.16, 1, 0.3, 1],
        }
      );
    });
  }

  // ============================================================================
  // Accent Text Paint-on Effect
  // ============================================================================
  const accentText = document.querySelector(".headline__accent");
  if (accentText) {
    // Create the ::before pseudo-element effect
    const beforeElement = accentText.querySelector("::before");
    if (accentText.style.position !== "relative") {
      accentText.style.position = "relative";
    }

    // Animate the mask progression for paint-on effect
    animate(
      accentText,
      {
        backgroundPosition: ["0% center", "100% center"],
      },
      {
        duration: 2.13, // 0.7s + 1.05s
        delay: 0.7,
        easing: [0.4, 0, 0.2, 1],
      }
    );
  }

  // ============================================================================
  // Lede Animation
  // ============================================================================
  const lede = document.querySelector(".lede__rise");
  if (lede) {
    animate(
      lede,
      {
        y: ["118%", "0%"],
        opacity: [0, 1],
      },
      {
        duration: 0.9,
        delay: 0.78,
        easing: [0.16, 1, 0.3, 1],
      }
    );
  }

  // ============================================================================
  // Advanced: Parallax on Hero Elements (Mouse Movement)
  // ============================================================================
  const page = document.querySelector(".page");
  const bgImage = document.querySelector(".bg-image");
  const hero = document.querySelector(".hero");

  if (page && bgImage && hero) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      // Subtle parallax on background (2% movement)
      animate(
        bgImage,
        {
          x: (x - 50) * 0.2,
          y: (y - 50) * 0.2,
        },
        { duration: 0.8, easing: "easeOut" }
      );

      // Subtle lift on hero content (3% movement)
      animate(
        hero,
        {
          y: -(y - 50) * 0.15,
        },
        { duration: 0.8, easing: "easeOut" }
      );
    });
  }

  // ============================================================================
  // Button Hover Animations
  // ============================================================================
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      animate(
        btn,
        {
          scale: 1.05,
          y: -2,
        },
        {
          duration: 0.3,
          easing: [0.16, 1, 0.3, 1],
        }
      );
    });

    btn.addEventListener("mouseleave", () => {
      animate(
        btn,
        {
          scale: 1,
          y: 0,
        },
        {
          duration: 0.3,
          easing: [0.16, 1, 0.3, 1],
        }
      );
    });
  });

  // ============================================================================
  // Logo Hover Animation
  // ============================================================================
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("mouseenter", () => {
      animate(
        logo,
        { scale: 1.1 },
        { duration: 0.35, easing: [0.16, 1, 0.3, 1] }
      );
    });

    logo.addEventListener("mouseleave", () => {
      animate(
        logo,
        { scale: 1 },
        { duration: 0.35, easing: [0.16, 1, 0.3, 1] }
      );
    });
  }

  // ============================================================================
  // Nav Links Hover Animation (underline bar)
  // ============================================================================
  const navLinkElements = document.querySelectorAll(".nav__link");
  navLinkElements.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      animate(link, { y: -2 }, { duration: 0.22, easing: [0.16, 1, 0.3, 1] });
    });

    link.addEventListener("mouseleave", () => {
      animate(link, { y: 0 }, { duration: 0.22, easing: [0.16, 1, 0.3, 1] });
    });
  });
})();

