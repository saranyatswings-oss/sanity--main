// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./Components/HomePage";
import "./App.css";
import Contact from "./Components/contact";
import Insights from "./Components/insights/Insights";
import InsightDetail from "./Components/insights/insightDetail";
import About from "./Components/About/about";
import Services from "./Components/Service/service";

function App() {

useEffect(() => {
  const tooltip = document.getElementById("tooltip");
  const tooltipText = document.getElementById("tooltip-text");

  if (!tooltip || !tooltipText) return;

  let x = 0, y = 0, tx = 0, ty = 0;
  let animationFrame;

  const splitTextAnimation = (text) => {
    tooltipText.innerHTML = "";

    text.split("").forEach((char, i) => {
      const span = document.createElement("span");
      span.classList.add("char");
      // ensure spaces are preserved visually by using a non-breaking space
      span.textContent = char === ' ' ? '\u00A0' : char;

      tooltipText.appendChild(span);

      setTimeout(() => {
        span.style.transform = "translateY(0)";
        span.style.opacity = "1";
        span.style.transition = "all 0.25s ease-out";
      }, i * 20);
    });
  };

  // Helper to safely get the closest element with data-text even when the event
  // target is a text node (which doesn't implement .closest)
  const getClosestDataTextElement = (target) => {
    if (!target) return null;
    let el = target;
    // Node.TEXT_NODE === 3
    if (el.nodeType === 3 && el.parentElement) el = el.parentElement;
    if (!el || typeof el.closest !== 'function') return null;
    return el.closest('[data-text]');
  };

  const handleEnter = (e) => {
    const el = getClosestDataTextElement(e.target);
    if (!el) return;

    const text = el.getAttribute("data-text");

    x = tx = e.clientX + 20;
    y = ty = e.clientY;

    tooltip.style.opacity = 1;
    splitTextAnimation(text);
  };

  const handleMove = (e) => {
    const el = getClosestDataTextElement(e.target);
    if (!el) return;

    x = e.clientX + 20;
    y = e.clientY;
  };

  const handleLeave = (e) => {
    const el = getClosestDataTextElement(e.target);
    if (!el) return;

    tooltip.style.opacity = 0;
    tooltipText.innerHTML = "";
  };

  document.addEventListener("mouseover", handleEnter);
  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseout", handleLeave);

  const animate = () => {
    tx += (x - tx) * 0.15;
    ty += (y - ty) * 0.15;

    tooltip.style.left = tx + "px";
    tooltip.style.top = ty + "px";

    animationFrame = requestAnimationFrame(animate);
  };

  animate();

  // ✅ CLEANUP (VERY IMPORTANT)
  return () => {
    document.removeEventListener("mouseover", handleEnter);
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseout", handleLeave);
    cancelAnimationFrame(animationFrame);
  };
}, []);
  return (
    <BrowserRouter>
      <div className="app">
        {/* Global tooltip container used by the document-level tooltip script */}
        <div id="tooltip" className="custom-tooltip" aria-hidden>
          <div id="tooltip-text" className="tooltip-text" />
        </div>

        <main>
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<Contact />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/insight/:slug" element={<InsightDetail   />} />
                  <Route path="/about" element={<About   />} />
                   <Route path="/service" element={<Services   />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
