/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        "1.5px": "1.5px",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        "sf-pro-display": ["SF Pro Display", "sans-serif"],
        "roboto-mono": ["Roboto Mono", "monospace"],
      },
      borderWidth: {
        0.5: "0.5px",
      },
      colors: {
        // Purple accent colors
        "purple-accent": "hsl(var(--purple-accent) / <alpha-value>)",
        "purple-background": "hsl(var(--purple-background) / <alpha-value>)",
        "purple-foreground": "hsl(var(--purple-foreground) / <alpha-value>)",
        "purple-accent-hover": "hsl(var(--purple-accent-hover) / <alpha-value>)",
        "border-purple": "hsl(var(--border-purple) / <alpha-value>)",
        "purple-accent-foreground": "hsl(var(--purple-accent-foreground) / <alpha-value>)",
        "purple-accent-hover-secondary": "hsl(var(--purple-accent-hover-secondary) / <alpha-value>)",
        // Blue accent colors
        "blue-accent": "hsl(var(--blue-accent) / <alpha-value>)",
        "blue-background": "hsl(var(--blue-background) / <alpha-value>)",
        "blue-foreground": "hsl(var(--blue-foreground) / <alpha-value>)",
        "blue-accent-hover": "hsl(var(--blue-accent-hover) / <alpha-value>)",
        "border-blue": "hsl(var(--border-blue) / <alpha-value>)",
        "blue-accent-foreground": "hsl(var(--blue-accent-foreground) / <alpha-value>)",
        "custom-dot-hover-bg": "#1E293B",
        "dot-active-bg": "hsl(var(--dot-active-bg))",
        "dot-active-hover-bg": "hsl(var(--dot-active-hover-bg))",
        "dot-active-icon": "hsl(var(--dot-active-icon))",
        "prompt-modal-background": "hsl(var(--prompt-modal-background))",
        "ocr-modal-bg": "hsl(var(--ocr-modal-bg))",
        "node-start-end-connector": "hsl(var(--node-start-end-connector) / <alpha-value>)",
        "node-subflow": "hsl(var(--node-subflow) / <alpha-value>)",
        "nodes-success": "hsl(var(--nodes-success) / <alpha-value>)",
        "nodes-warning": "hsl(var(--nodes-warning) / <alpha-value>)",
        canvasBlack: "#090d1b",
        darkGray: "#232225",
        lightGray: "#acacab",
        deepGray: "#292927",
        mediumGray: "#454341",
        softGray: "#E4E4E4",
        charcoalGray: "#21201f",
        lightBlue: "#9eb1ff",
        blue_700: "#2b6cb0",
        blue_400: "#4299E3",
        "blue-400": "#6381E3",
        runBlue: "#3e63dd",
        purple_400: "#9f7aea",
        blueGray: "#718096",
        deepBlue: "#2c5282",
        skyBlue: "#00749E",
        hoverGray: "#4f587a",
        "blue-50": "#EFF6FF",
        surface: {
          10: {
            DEFAULT: "#0F152C",
            dark: "#98ADFF",
          },
          99: {
            DEFAULT: "colors/blue/50",
            dark: "Colors/Surfaces/00",
          },
          "00": {
            DEFAULT: "#98ADFF",
            dark: "#0F152C",
          },
          "01": {
            DEFAULT: "#91A7F5",
            dark: "#1C243E",
          },
          "02": {
            DEFAULT: "#8295DB",
            dark: "#263049",
          },
          "03": {
            DEFAULT: "#7384C2",
            dark: "#2D3552",
          },
          "04": {
            DEFAULT: "#6573AA",
            dark: "#3C466C",
          },
          "05": {
            DEFAULT: "#4E5C8D",
            dark: "#4E5C8D",
          },
          "06": {
            DEFAULT: "#3C466C",
            dark: "#6573AA",
          },
          "07": {
            DEFAULT: "#2D3552",
            dark: "#7384C2",
          },
          "08": {
            DEFAULT: "#263049",
            dark: "#8295DB",
          },
          "09": {
            DEFAULT: "#1C243E",
            dark: "#91A7F5",
          },
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
          hover: "hsl(var(--warning-hover) / <alpha-value>)",
        },
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "general-hover-secondary": "hsl(var(--general-hover-secondary) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        "border-destructive": "hsl(var(--border-destructive) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          1: "hsl(var(--chart-1) / <alpha-value>)",
          2: "hsl(var(--chart-2) / <alpha-value>)",
          3: "hsl(var(--chart-3) / <alpha-value>)",
          4: "hsl(var(--chart-4) / <alpha-value>)",
          5: "hsl(var(--chart-5) / <alpha-value>)",
        },
        nodes: {
          "data-processing": "hsl(var(--nodes-data-processing) / <alpha-value>)",
          agents: "hsl(var(--nodes-agents) / <alpha-value>)",
          logic: "hsl(var(--nodes-logic) / <alpha-value>)",
          custom: "hsl(var(--nodes-custom) / <alpha-value>)",
          "not-assigned": "hsl(var(--nodes-not-assigned) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          hover: "hsl(var(--success-hover) / <alpha-value>)",
        },
        "neon-green": "hsl(var(--neon-green) / <alpha-value>)",
        focus: "hsl(var(--focus) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "3xl": "calc(var(--radius) * 3)",
      },
      boxShadow: {
        "action-btn-inset": "0px 1px 1px 0px rgba(248, 250, 252, 0.08) inset, 0px 1px 1px 0px rgba(15, 23, 42, 0.08)",
      },
      animation: {
        slideDown: "slideDown 300ms ease-out forwards",
        slideUp: "slideUp 300ms ease-out forwards",
        zoomTiltOut: "zoomTiltOut ease-out forwards",
        jumpTop: "jumpTop 150ms forwards ease-in-out",
        jumpBottom: "jumpBottom 150ms forwards ease-in-out",
        spinSlow: "spin 2s linear infinite",
        "z-index-slide-in": "z-index-rise 200ms forwards steps(1, end), enter 200ms forwards ease",
        leftToRight: "leftToRight 10s ease-in-out forwards",
        "gradient-sweep": "gradientSweep 4s linear infinite reverse",
        "spin-custom": "spinCustom 800ms infinite",
        "flow-status-opacity": "flowStatusOpacity 3s ease-in-out infinite alternate",
      },
      keyframes: {
        slideDown: {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        slideUp: {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        zoomTiltOut: {
          from: { opacity: 1, transform: "scale(1) rotateX(0deg)" },
          to: { opacity: 0, transform: "scale(0.5) rotateX(80deg)" },
        },
        jumpTop: {
          to: { zIndex: 1000 },
        },
        jumpBottom: {
          to: { zIndex: -1 },
        },
        "z-index-rise": {
          from: { zIndex: "var(--z-index-rise-from, 5)" },
          to: { zIndex: "var(--z-index-rise-to, 50)" },
        },
        leftToRight: {
          "0%": { transform: "translateX(-100%)", opacity: 0, zIndex: -1 },
          "100%": { transform: "translateX(0)", opacity: 1, zIndex: 10 },
        },
        gradientSweep: {
          // "0%": { backgroundPosition: "100% 50%, center" },
          // "25%": { backgroundPosition: "75% 50%, center" },
          // "50%": { backgroundPosition: "50% 50%, center" },
          // "75%": { backgroundPosition: "25% 50%, center" },
          // "100%": { backgroundPosition: "100% 50%, center" },
          "0%": { backgroundPosition: "-200% 50%" },
          // "66%": { backgroundPosition: "125% 0, -150% 0" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        spinCustom: {
          "0%": {
            transform: "rotate(0deg)",
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          },
          "62.5%": {
            transform: "rotate(-135deg)",
            animationTimingFunction: "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
          },
          "100%": {
            transform: "rotate(0deg)",
          },
        },
        flowStatusOpacity: {
          "0%": { opacity: "0.55" },
          "100%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "ai-gradient":
          "linear-gradient(92deg, var(--teal-300, #5EEAD4) 0%, var(--blue-500, #3B82F6) 32%, var(--purple-500, #A855F7) 66%, var(--rose-500, #F43F5E) 100%)",
      },
      // Add text fill utilities for gradient text
      textFillColor: {
        transparent: "transparent",
      },
      backgroundClip: {
        text: "text",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar")({ nocompatible: true }),
    require("tailwindcss-animate"),
    // Add plugin for text gradient support
    function ({ addUtilities, matchUtilities }) {
      const newUtilities = {
        ".text-gradient": {
          "background-clip": "text",
          "-webkit-background-clip": "text",
          color: "transparent",
          "-webkit-text-fill-color": "transparent",
        },
      };
      addUtilities(newUtilities);

      // z-rise-from-{n} and z-rise-to-{n} utilities for the z-index-rise keyframe
      matchUtilities(
        {
          "z-rise-from": (value) => ({ "--z-index-rise-from": value }),
          "z-rise-to": (value) => ({ "--z-index-rise-to": value }),
        },
        { values: { 0: "0", 5: "5", 10: "10", 20: "20", 30: "30", 40: "40", 50: "50", 60: "60", 100: "100" } }
      );
    },
  ],
};
