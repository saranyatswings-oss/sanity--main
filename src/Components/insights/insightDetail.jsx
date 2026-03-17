import React, { useEffect, useState, useRef } from "react";
import { client, urlFor } from "../../sanity/SainityClient";
import { useParams } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "./insightDetail.css";

const query = `
*[_type=="insight" && slug.current==$slug][0]{
  title,
  featuredImage,
  content,
  author{
    name,
    role,
    image
  }
}
`;


const InsightDetail = () => {

  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [headings, setHeadings] = useState([]);
  const contentRef = useRef(null);
  const maskRef = useRef(null);
  const imgRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [readMinutes, setReadMinutes] = useState(0);

  useEffect(() => {

    client.fetch(query, { slug }).then((res) => {

      setData(res);

      /* Extract headings from portable text */

      const extractedHeadings = [];

      res?.content?.forEach((block) => {

        if (
          block._type === "block" &&
          block.style &&
          block.style.startsWith("h")
        ) {

          const text = block.children.map((c) => c.text).join("");

          extractedHeadings.push({
            text,
            id: text.replace(/\s+/g, "-").toLowerCase(),
          });

        }

      });

      setHeadings(extractedHeadings);
      // estimate read time based on word count
      const allText = (res?.content || [])
        .map((block) => {
          if (block._type === 'block' && Array.isArray(block.children)) {
            return block.children.map((c) => c.text).join('');
          }
          if (typeof block === 'string') return block;
          return '';
        })
        .join(' ');

      const words = allText.trim().split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.round(words / 200));
      setReadMinutes(minutes);
    });

  }, [slug]);

  useEffect(() => {
    // reading progress handler
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return setProgress(0);

      const rect = el.getBoundingClientRect();
      const elTop = window.scrollY + rect.top;
      const total = el.scrollHeight - window.innerHeight;
      if (total <= 0) return setProgress(100);

      const current = window.scrollY - elTop;
      const pct = Math.round((current / total) * 100);
      setProgress(Math.max(0, Math.min(100, pct)));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [data]);

  useEffect(() => {
    // Parallax effect for featured image inside mask
    const mask = maskRef.current;
    const img = imgRef.current;
    if (!mask || !img) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = mask.getBoundingClientRect();
      const winH = window.innerHeight || document.documentElement.clientHeight;

      // distance of element center from viewport center, normalized to [-1,1]
      const elCenter = rect.top + rect.height / 2;
      const viewportCenter = winH / 2;
      const maxDist = (winH / 2) + (rect.height / 2);
      let norm = (elCenter - viewportCenter) / maxDist;
      norm = Math.max(-1, Math.min(1, norm));

      // maximum shift in px (15% of mask height)
      const maxShift = rect.height * 0.15;
      const translateY = Math.round(norm * maxShift);

      img.style.transform = `translate3d(0, ${translateY}px, 0)`;
    };

    const onScrollParallax = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    // initial update
    update();
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    window.addEventListener('resize', onScrollParallax);

    return () => {
      window.removeEventListener('scroll', onScrollParallax);
      window.removeEventListener('resize', onScrollParallax);
    };
  }, [data]);

  /* Custom PortableText heading renderer */

  const components = {
    block: {

      h2: ({ children }) => {
        const text = children[0];
        const id = text.replace(/\s+/g, "-").toLowerCase();

        return <h2 id={id}>{children}</h2>;
      },

      h3: ({ children }) => {
        const text = children[0];
        const id = text.replace(/\s+/g, "-").toLowerCase();

        return <h3 id={id}>{children}</h3>;
      }

    }
  };

  const scrollToHeading = (id) => {

    const el = document.getElementById(id);

    if (el) {

      el.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  };

  if (!data) return <div>Loading...</div>;

  return (
    <>
      <Navbar />

      <section className="insight-detail section">
        <div className="top-detail">
          <div className="hero-wrapper-insight">
                   <div className="title-wrapper">
       <h1 className="">{data.title}</h1>
            </div>
              {/* Meta row: date/time and share */}
            <div className="meta-row container">
              <div className="meta-left">
                {data._createdAt && (() => {
                  const d = new Date(data._createdAt);
                  const opts = { year: 'numeric', month: 'long', day: 'numeric' };
                  const datePart = d.toLocaleDateString(undefined, opts);
                  let hours = d.getHours();
                  const minutes = d.getMinutes().toString().padStart(2,'0');
                  const ampm = hours >= 12 ? 'pm' : 'am';
                  hours = hours % 12 || 12;
                  return <div className="meta-date">{datePart} &nbsp; {hours}:{minutes} {ampm}</div>;
                })()}
              </div>
              <div className="meta-right">
                <div className="share-controls">
                  <button className="share-btn" aria-label="share">🔗</button>
                  <button className="share-btn" aria-label="more">⤴</button>
                </div>
              </div>
            </div>
              
          </div>
     

            {data.featuredImage && (
              <div className="featured-mask" ref={maskRef}>
                <img
                  ref={imgRef}
                  src={urlFor(data.featuredImage).width(1600).url()}
                  alt={data.title}
                  className="featured-image"
                />
              </div>
            )}
        </div>

        <div className="container insight-layout">

          {/* LEFT SIDEBAR */}

          <aside className="insight-sidebar">

            <div className="read-meta">
              <div className="meta-top">
                <div className="read-time">{readMinutes} min read</div>
                <div className="progress-percent" aria-hidden>{progress}%</div>
              </div>
              <div className="progress-bar" aria-hidden>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="contents-box">
              <h4>Jump to Section</h4>
              <ul>
                {headings.map((heading, index) => (
                  <li key={index} onClick={() => scrollToHeading(heading.id)}>
                    {heading.text}
                  </li>
                ))}
              </ul>
            </div>

          </aside>

          {/* MAIN CONTENT */}

          <article className="insight-content">

        

            <div ref={contentRef} className="rich-text">

              <PortableText
                value={data.content}
                components={components}
              />

            </div>

            <div className="author-box">

  {data.author?.image && (
    <img
      src={urlFor(data.author.image).width(80).url()}
      alt={data.author.name}
    />
  )}

  <div>
    <p className="author-name">{data.author?.name}</p>
    <span className="author-role">{data.author?.role}</span>
  </div>

</div>

          </article>

        </div>

      </section>

      <Footer />
    </>
  );
};

export default InsightDetail;