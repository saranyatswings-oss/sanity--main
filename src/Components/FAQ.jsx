import React, { useRef, useState } from 'react';
import './styles.css';

const defaultItems = [
  { q: 'Do you work with startups, or only big brands?', a: 'We work with both startups and established brands — our approach scales to project size and budget. We treat each client uniquely and tailor our process accordingly.' },
  { q: "We're not in the same city. Does that matter?", a: 'Not at all. We’ve partnered with distributed teams worldwide. We rely on remote collaboration tools and regular touchpoints to keep momentum.' },
  { q: 'What differentiators in your approach support the premium investment?', a: 'Our differentiators are deep product thinking, polished craft, and measurable outcomes — we focus on converting design into business value.' },
  { q: 'Can I get a quote without a detailed brief?', a: 'We can provide a ballpark estimate after a short discovery call, but accurate scoping needs a brief or initial workshop.' },
  { q: "What's your approach to scaling brand experiences globally while honoring regional differences?", a: 'We design systems that are flexible and localizable; we create guidelines and components that can be adapted per market.' },
  { q: 'Can you design a homepage for our pitch before we commit to a full engagement?', a: 'Yes — we offer scoped discovery and rapid prototype packages designed for pitches and investor-ready demos.' },
  { q: "What's the risk of not improving your UI/UX with us now?", a: 'Delaying product improvements can mean missed growth opportunities and lower conversion. We help prioritize high-impact work first.' }
];

export default function FAQ({ items = defaultItems }) {
  const [openIndex, setOpenIndex] = useState(null);
  const contentRefs = useRef([]);

  const toggle = (i) => {
    const currentlyOpen = openIndex;

    // If clicking the already-open item -> close it
    if (currentlyOpen === i) {
      const el = contentRefs.current[i];
      if (!el) {
        setOpenIndex(null);
        return;
      }
      // from auto -> px (if needed) to start transition
      if (getComputedStyle(el).height === 'auto') {
        el.style.height = el.scrollHeight + 'px';
      }
      // allow frame then close
      requestAnimationFrame(() => {
        el.style.height = '0px';
      });
      setOpenIndex(null);
      return;
    }

    // close previous smoothly
    if (currentlyOpen !== null) {
      const prev = contentRefs.current[currentlyOpen];
      if (prev) {
        // ensure measured start height then collapse
        prev.style.height = prev.scrollHeight + 'px';
        requestAnimationFrame(() => {
          prev.style.height = '0px';
        });
      }
    }

    // open new
    const el = contentRefs.current[i];
    if (el) {
      // start from 0 to measured height for transition
      el.style.height = '0px';
      const h = el.scrollHeight;
      requestAnimationFrame(() => {
        el.style.height = h + 'px';
      });

      // after transition, set to auto to allow responsive content
      const onEnd = (e) => {
        if (e.target !== el) return;
        // only set to auto if the element didn't fully collapse
        if (el.style.height && el.style.height !== '0px') {
          el.style.height = 'auto';
        }
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    }

    setOpenIndex(i);
  };

  return (
    <section className="faq-section section">
      <div className="container">
        <div className="faq-hero">
          <h2 className="faq-heading">Insights worth knowing before we begin working together</h2>
        </div>

        <div className="faq-list">
          {items.map((it, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-content-${i}`}
              >
                <span className="faq-index">{String(i + 1).padStart(2, '0')}.</span>
                <span className="faq-q">{it.q}</span>
                <span className="faq-chevron">{openIndex === i ? '▴' : '▾'}</span>
              </button>

              <div
                id={`faq-content-${i}`}
                className="faq-answer-wrapper"
                ref={(el) => (contentRefs.current[i] = el)}
                style={{ height: openIndex === i ? undefined : '0px' }}
                aria-hidden={openIndex !== i}
              >
                <div className="faq-answer">
                  {it.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
