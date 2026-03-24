import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/Images/logo-wings.svg";
import "./styles.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  // position: 'onscreen' | 'off-top' | 'off-bottom'
  const [position, setPosition] = useState('onscreen');
  const [scrolled, setScrolled] = useState(false); // whether page scrolled past top
  const lastScroll = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const wrapperRef = useRef(null);
  const desktopToggleRef = useRef(null);
  const panelRef = useRef(null);
  const prevFocusRef = useRef(null);
  const [useBlend, setUseBlend] = useState(false);

  useEffect(() => {
    // Manage focus, escape-to-close and body scroll locking for desktop panel
    if (typeof window === "undefined") return;
    const panel = panelRef.current;
    const toggle = desktopToggleRef.current;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDesktopOpen(false);
      }
    };

    if (desktopOpen) {
      // save previously focused element
      prevFocusRef.current = document.activeElement;
      // lock body scroll
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey, { passive: true });
      // focus the panel or the first focusable element inside
      requestAnimationFrame(() => {
        try {
          const focusable = panel?.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
          (focusable || panel)?.focus();
        } catch (e) {
          /* ignore */
        }
      });
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      // restore focus
      try {
        prevFocusRef.current?.focus?.();
      } catch (e) {
        /* ignore */
      }
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [desktopOpen]);


  

  useEffect(() => {
    let ticking = false;
    const SENSITIVITY = 6; 

    const onScroll = () => {
      const current = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = current - lastScroll.current;

          // 1. At the very top of the page
          if (current <= 10) {
            setPosition('onscreen');
            setScrolled(false);
          } else {
            setScrolled(true);
          
            // 2. Scrolling down
            if (delta > SENSITIVITY) {
              setPosition('off-top'); 
            } 
            // 3. Scrolling up
            else if (delta < -SENSITIVITY) {
              setPosition('onscreen'); 
              // Notice: scheduleHide() is gone! 
              // The nav will now stay on screen until they scroll down.
            }
          }

          lastScroll.current = current;
          ticking = false;
        });
        ticking = true;
      }
    };

    // ensure nav is visible initially (fixed at top)
    setPosition('onscreen');

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const navHeight = wrapperRef.current?.offsetHeight || 80;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {

        setUseBlend(entry.isIntersecting);
      });
    }, { root: null, rootMargin: `-${navHeight}px 0px 0px 0px`, threshold: [0] });

    // initial check: if hero is already under the nav, enable blend
    try {
      const rect = hero.getBoundingClientRect();
      if (rect.top <= navHeight) setUseBlend(true);
    } catch (e) {
      /* ignore */
    }

    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`nav-wrapper ${position} ${scrolled ? "scrolled" : ""} ${useBlend ? 'use-blend' : ''}`}
    >
      <header className="site-header">
        <div className="site-inner">
          <nav className="left-nav">
            <a href="#what">//WHAT WE DO</a>
            <a href="#work">//WORK</a>
            <a href="#inside">//INSIDE WINGS</a>
          </nav>

          <div className="center-logo" aria-hidden="true">
            <div className="logo"><img className="logo-header" src={logo} alt="" /></div>
          </div>

          <div className="right-nav">
            <a href="/contact" className="lets-talk">//LET'S TALK</a>

            {/* Desktop hamburger toggle (visible on larger viewports) */}
            <button
              ref={desktopToggleRef}
              className="desktop-toggle"
              aria-label={desktopOpen ? 'Close panel' : 'Open panel'}
              aria-expanded={desktopOpen}
              onClick={() => setDesktopOpen((s) => !s)}
            >
              <span className="burger" />
            </button>

            {/* Mobile toggle remains for small screens */}
            <button
              className="mobile-toggle"
              aria-label="Menu"
              onClick={() => setNavOpen((s) => !s)}
            >
              <span className="burger" />
            </button>
          </div>
        </div>

        <div className={`mobile-nav ${navOpen ? "open" : ""}`}>
          <a href="#what" onClick={() => setNavOpen(false)}>//WHAT WE DO</a>
          <a href="#work" onClick={() => setNavOpen(false)}>//WORK</a>
          <a href="#inside" onClick={() => setNavOpen(false)}>//INSIDE WINGS</a>
          <a href="#contact" onClick={() => setNavOpen(false)}>//LET'S TALK</a>
        </div>
        {/* Desktop overlay (click to close) */}
        <div
          className={`desktop-hamburger-overlay ${desktopOpen ? 'open' : ''}`}
          onClick={() => setDesktopOpen(false)}
          aria-hidden={!desktopOpen}
        />

        {/* Desktop hamburger sliding panel - full-screen layout */}
        <div
          ref={panelRef}
          className={`desktop-hamburger-panel ${desktopOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal={desktopOpen}
          aria-hidden={!desktopOpen}
        >
          <div className="panel-top">
            <div className="panel-top-inner">
              <div className="panel-top-logo"><img src={logo} alt="logo" /></div>
              <button className="panel-close" onClick={() => setDesktopOpen(false)} aria-label="Close panel">×</button>
            </div>
          </div>

          <div className="panel-inner">
            <div className="panel-grid">
              <div className="panel-left">
                <video
                  className="panel-video"
                  src="https://cdn.sanity.io/files/bkyggyf6/production/4c5cf4ce2cc42f04b71dd8ed88d05a00ba935786.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              </div>

              <div className="panel-center">
                <ul className="panel-menu">
                  <li>WORK</li>
                   <Link className="nav-link"to="/service"><li>SERVICES</li></Link>
                  <li>INDUSTRIES</li>
                  <li>PROCESS <span className="badge">COMING SOON</span></li>
                  <li>WHAT'S NEW</li>
                  <li>ENGAGEMENT <span className="badge">COMING SOON</span></li>
                </ul>
              </div>

              <div className="panel-right">
                <div className="panel-section">
                  <div className="small-label">//INSIDE WINGS</div>
                  <ul className="panel-links">
                    <Link className="nav-link"to="/about"><li>ABOUT</li></Link>
                    <Link className="nav-link" to="/about"><li>PEOPLE</li></Link>
                    <Link className="nav-link" to="/about"><li>CULTURE</li></Link>
                    <Link className="nav-link" to="/about"><li>CAREERS</li></Link>
                
                  </ul>
                </div>

                <div className="panel-section">
                  <div className="small-label">//REACH US</div>
                  <ul className="panel-links">
                    <li>CONTACT</li>
                    <li>BOOK A CALL</li>
                  </ul>
                </div>

                <div className="panel-footer">INDIA – DUBAI – SINGAPORE – USA – AUSTRALIA</div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
