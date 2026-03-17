import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Lenis from '@studio-freight/lenis';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Initialize Lenis smooth scrolling
try {
  // Only run in the browser environment
  if (typeof window !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      direction: 'vertical'
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    // expose for debugging if needed
    window.__lenis = lenis;

    // Smooth scroll for internal anchor links using Lenis
    document.addEventListener('click', (e) => {
      const el = e.target.closest && e.target.closest('a[href^="#"]');
      if (!el) return;
      const href = el.getAttribute('href');
      if (!href || href === '#') return;
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        // lenis.scrollTo accepts numeric value or element
        lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      }
    }, { passive: false });
  }
} catch (e) {
  // If Lenis isn't installed or errors, don't crash the app.
  // The developer should run `npm install` to add the dependency.
  // console.warn('Lenis init failed:', e);
}
