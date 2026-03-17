
import React, { useEffect, useState } from "react";
import Footerlogo from "../assets/Images/Wings-footer-1.svg";
import Arrow from "../assets/Images/arrow.svg";
import "./styles.css";
import Navbar from "./Navbar";
import FAQ from "./FAQ";
import { client, urlFor } from "../sanity/SainityClient";
import { PortableText } from '@portabletext/react';
import Lottie from "lottie-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroAnimation from "../assets/Images/Final-Top-Banner.json";


// React-friendly animated text component that splits a string into letter spans
function AnimatedText({ tag = 'span', text, className, delayIndex = 0, children }) {
  const Tag = tag;
  const ref = React.useRef(null);

  // choose string to render: prefer text prop, then children if it's a string
  const content = typeof text === 'string' ? text : (typeof children === 'string' ? children : null);

  React.useEffect(() => {
    // GSAP removed — no per-character animation. Characters render statically.
    // This effect intentionally left blank so AnimatedText simply renders character spans.
  }, [content, delayIndex]);

  if (content === null) {
    // not a simple string - render children as-is
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className} ref={ref} aria-hidden={false}>
      {Array.from(content).map((ch, i) => (
        <span key={i} className="char">
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </Tag>
  );
}
const homeQuery = `
*[_type == "homePage"][0]{
  hero{
    smallLabel,
    heading,
    subText,
    video{
      asset->{
        _id,
        url
      }
    }
  },

  statement{
    largeText
  },

  projects{
    sectionTitle,
    description,
    projects[]->{
      _id,
      title,
      category,
      shortDescription,
      media{
        mediaType,
        image{
          asset->{
            _id,
            url
          }
        },
        video{
          asset->{
            _id,
            url
          }
        }
      }
    }
  },

  awards,

  services,

  trust{
    heading,
    founders[]->{
      _id,
      name,
      role,
      testimonial,
      photo{
        asset->{
          _id,
          url
        }
      }
    }
  },

  testimonials{
    heading,
    subheading,
    testimonials[]->{
      _id,
      name,
      designation,
      message,
      rating,
      photo{
        asset->{
          _id,
          url
        }
      }
    }
  },

  industries,

  cta{
    heading,
    subText,
    description,
    buttonText,
    buttonLink
  },

  news{
    sectionTitle,
    sectionHeading,
    newsItems[]->{
      _id,
      title,
      heading,
      description,  
      band,
      publishedAt,
      image{
        asset->{
          _id,
          url
        }
      }
    }
  }
}
`;

const insightsQuery = `
*[_type == "insight"] | order(publishedDate desc){
  _id,
  title,
  slug,
  band,
  excerpt,
  readingTime,
  publishedDate,
  featuredImage{
    asset->{
      url
    }
  }
}
`;
export default function HomePage() {
  const [data, setData] = useState(null);
const [insights, setInsights] = useState([]);
  // detect mobile breakpoint so slides group size can change
  const [isMobile, setIsMobile] = useState(false);

  // live timezone clocks for hero labels
  const [indiaTime, setIndiaTime] = useState("");
  const [usaTime, setUsaTime] = useState("");

  // slider state for testimonials
  const [index, setIndex] = useState(0);

  // GSAP timeline ref for testimonial transitions
  const testimonialTl = React.useRef(null);
  const animatingToRef = React.useRef(-1);

  // safe reference to the testimonials array from fetched data
  const items = data?.testimonials?.testimonials || [];

  // update isMobile on resize (match mobile breakpoint used elsewhere)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const update = () => setIsMobile(window.innerWidth <= 980);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // group items into slides: 1 per slide on mobile, 2 per slide on desktop
  const slides = React.useMemo(() => {
    const s = [];
    const groupSize = isMobile ? 1 : 2;
    for (let i = 0; i < items.length; i += groupSize) {
      s.push(items.slice(i, i + groupSize));
    }
    return s;
  }, [items, isMobile]);

  // current slide items (two columns: left large portrait, right smaller portrait + text)
  const currentSlide = slides[index] || [];
  const leftItem = currentSlide[0] || null;
  const rightItem = currentSlide[1] || null;

  const next = () => {
    // keep legacy next as fallback; prefer animateTo for transitions
    animateTo(index + 1, 1);
  };

  const prev = () => {
    animateTo(index - 1, -1);
  };

  // animateTo controls the transition between slides using GSAP
  function animateTo(nextIndex, direction = 1) {
    if (!slides.length) return;
    const pageCount = slides.length;
    nextIndex = ((nextIndex % pageCount) + pageCount) % pageCount;
    if (nextIndex === index) return;

    // if an animation is running, kill and snap-complete
    if (testimonialTl.current) {
      try {
        testimonialTl.current.kill();
      } catch (e) {}
      testimonialTl.current = null;
      animatingToRef.current = -1;
    }

    animatingToRef.current = nextIndex;

    const curLeftImg = document.querySelector('.testimonial-left .large-portrait img');
    const curRightImg = document.querySelector('.testimonial-right .small-portrait img');
    const curTexts = Array.from(document.querySelectorAll('.testimonial-text, .testimonial-quote, .testimonial-name, .testimonial-role'));

    const exitClip = direction === -1 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)';
    const enterClipStart = direction === -1 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)';

    const tl = gsap.timeline({
      onComplete() {
        // after exit complete, update index (DOM updates to next slide)
        setIndex(nextIndex);
        testimonialTl.current = null;
        animatingToRef.current = -1;
        // animate entry after DOM update
        requestAnimationFrame(() => {
          const newLeftImg = document.querySelector('.testimonial-left .large-portrait img');
          const newRightImg = document.querySelector('.testimonial-right .small-portrait img');
          const newTexts = Array.from(document.querySelectorAll('.testimonial-text, .testimonial-quote, .testimonial-name, .testimonial-role'));
          if (newLeftImg) gsap.set(newLeftImg, { clipPath: enterClipStart });
          if (newRightImg) gsap.set(newRightImg, { clipPath: enterClipStart });
          gsap.to(newTexts, { opacity: 1, duration: 0.5, ease: 'power2.out' });
          gsap.to(newLeftImg, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' });
          gsap.to(newRightImg, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' });
        });
      },
    });

    testimonialTl.current = tl;

    // exit animations
    if (curLeftImg) tl.to(curLeftImg, { clipPath: exitClip, duration: 0.95, ease: 'power2.inOut' }, 0);
    if (curRightImg) tl.to(curRightImg, { clipPath: exitClip, duration: 0.95, ease: 'power2.inOut' }, 0.1);
    tl.to(curTexts, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 0);
  }

  // initialize clipPath/opacity for current slide on mount/data change
  useEffect(() => {
    // pick images/texts for either desktop two-column layout or mobile single-card
    const leftImg = document.querySelector('.testimonial-left .large-portrait img') || document.querySelector('.testimonial-single .large-portrait img');
    const rightImg = document.querySelector('.testimonial-right .small-portrait img');
    const texts = Array.from(document.querySelectorAll('.testimonial-text, .testimonial-quote, .testimonial-name, .testimonial-role, .homepage-testimonial__card-content'));
    if (leftImg) gsap.set(leftImg, { clipPath: 'inset(0% 0% 0% 0%)' });
    if (rightImg) gsap.set(rightImg, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(texts, { opacity: 1 });
  }, [data, index]);

  // clamp index if slides change (e.g., viewport switch)
  useEffect(() => {
    if (!slides.length) return;
    if (index >= slides.length) setIndex(0);
  }, [slides, index]);
  
const portableComponents = {
  types: {
    image: ({ value }) => {
      return (
        <img
          src={urlFor(value).width(60).url()}
          alt=""
          style={{
            display: "inline-block",
            width: "80px",
            verticalAlign: "middle",
            margin: "0 8px"
          }}
        />
      );
    }
  }
};
useEffect(() => {
  client.fetch(homeQuery).then((res) => {
    setData(res);
  });

  client.fetch(insightsQuery).then((res) => {
    setInsights(res);
  });
}, []);

  // Letter-scrub interaction removed per user request.

  useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);

  const headings = document.querySelectorAll(".scrub-heading");

  headings.forEach((heading) => {
    const chars = heading.querySelectorAll(".char");

    gsap.fromTo(
      chars,
      {
        opacity: 0.1,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 80%",
          end: "top 30%",
          scrub: true, // 🔥 this makes it scrub with scroll
        },
      }
    );
  });

  return () => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
}, [data]);

  // update clocks every 30 seconds
  useEffect(() => {
    const formatT = (timeZone, locale = "en-US") =>
      new Date().toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone,
      });
//potable text for statement section

    const update = () => {
      try {
        setIndiaTime(formatT("Asia/Kolkata", "en-IN"));
        setUsaTime(formatT("America/New_York", "en-US"));
      } catch (e) {
        // fallback to local time if timezone not supported
        const now = new Date();
        setIndiaTime(now.toLocaleTimeString());
        setUsaTime(now.toLocaleTimeString());
      }
    };

    update();
    const id = setInterval(update, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  // GSAP-based testimonial animations removed per request.

  // GSAP-based generic heading animations removed per request.

  // Smooth scroll using Lenis (optional dependency). Provides slower, buttery scrolling.
  // To enable: run `npm install @studio-freight/lenis` in your project root.
  useEffect(() => {
    let rafId = null;
    let lenis = null;

    const initLenis = async () => {
      try {
        const module = await import('@studio-freight/lenis');
        const Lenis = module?.default || module;
        // Create Lenis instance with slower feel (duration controls scroll easing)
        lenis = new Lenis({
          duration: 1.6, // increase for slower feeling
          easing: (t) => Math.min(1, 1 - Math.pow(1 - t, 3)),
          smooth: true,
          direction: 'vertical',
          gestureDirection: 'vertical',
        });

        // RAF loop for Lenis
        const raf = (time) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        };

        rafId = requestAnimationFrame(raf);

        // GSAP removed — no ticker synchronization.
      } catch (err) {
        // Lenis not installed: ignore silently but log so developer can install it
        // console.warn('Lenis not available. Install with: npm install @studio-freight/lenis');
      }
    };

    initLenis();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis && typeof lenis.destroy === 'function') lenis.destroy();
    };
  }, []);

  // Desktop-only: initialize the DOM-driven testimonial slider after data is available.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    // run on desktop only (match existing CSS breakpoint where .right-nav .lets-talk hides)
    if (window.innerWidth <= 980) return undefined;

    let cleanupFn = null;
    let mounted = true;

    const loadSlider = async () => {
      try {
        const mod = await import('./desktopTestimonialSlider');
        if (!mounted) return;
        // module default is an init function that returns a cleanup function
        if (typeof mod.default === 'function') cleanupFn = mod.default();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load desktop testimonial slider', err);
      }
    };

    // Only initialize the DOM-driven slider if the legacy homepage markup exists
    // (the module expects `.homepage-testimonial__cards-wrapper`). For our React
    // markup we use GSAP-driven transitions below instead.
    if (
      data &&
      data.testimonials &&
      data.testimonials.testimonials &&
      data.testimonials.testimonials.length &&
      document.querySelector('.homepage-testimonial__cards-wrapper')
    ) {
      loadSlider();
    }

    return () => {
      mounted = false;
      if (typeof cleanupFn === 'function') cleanupFn();
    };
  }, [data]);

  // Mobile-only: initialize mobile DOM-driven testimonial slider when our mobile wrapper exists
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.innerWidth > 980) return undefined; // mobile only

    let cleanupFn = null;
    let mounted = true;

    const loadMobile = async () => {
      try {
        const mod = await import('./mobileTestimonialSlider');
        if (!mounted) return;
        if (typeof mod.default === 'function') cleanupFn = mod.default();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load mobile testimonial slider', err);
      }
    };

    if (data && data.testimonials && data.testimonials.testimonials && data.testimonials.testimonials.length && document.querySelector('.homepage-testimonial__cards-wrapper-mobile')) {
      loadMobile();
    }

    return () => {
      mounted = false;
      if (typeof cleanupFn === 'function') cleanupFn();
    };
  }, [data]);

  if (!data) return <div>Loading...</div>;

  return (
    <>
      {/* Use the Navbar component so its scroll behaviour works globally */}
      <Navbar />

      {/* HERO */}
      <section className="hero section">
        <div className="container">
          <div className="hero-wrap">
            {(data.hero?.illustration || heroAnimation) && (
              <div className="hero-bg-image" aria-hidden="true">
                <Lottie
                  animationData={heroAnimation}
                  loop={true}
                  autoplay={true}
                  className="hero-lottie"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            )}
            <div className="hero-content">
            <div className="span-wrapper">
             <span className="small-label" aria-live="polite" aria-atomic="true">
              {indiaTime ? `IND ${indiaTime}` : "IND --:--"}
             </span>
              <span className="small-label" aria-live="polite" aria-atomic="true">
              {usaTime ? `USA ${usaTime}` : "USA --:--"}
             </span>

             </div>
{/* <AnimatedText
  tag="h1"
  className=" scrub-heading"
  text={data.hero?.heading}
/>  */}

<h1 className="here-h1">{data.hero?.heading}</h1>
 </div>
          </div>  
        </div>
      </section>



    {/* full siz video */}
<section className="full section">
  {data.hero?.video?.asset?.url && (
    <video  autoPlay muted loop playsInline className="hero-video">
      <source src={data.hero.video.asset.url} type="video/mp4" />
    </video>
  )}
</section>

      {/* STATEMENT */}
     <section className="statement section">
  <div className="container">
    <h2 className="statement-heading">
      <PortableText
      className="statement-text"
        value={data.statement?.largeText}
        components={portableComponents}
      />
    </h2>
  </div>
</section>

  {/* PROJECTS */}
      <section className="projects section">
        <div className="container">
      <div className="projects-intro">
            <h3>{data.projects?.sectionTitle}</h3>
          <p className="project-description">{data.projects?.description}</p>
      </div>
          <div className="projects-wrapper"><p className="sub-texts">/ recent Works</p></div>
          <div className="project-grid">
  {data.projects?.projects?.map((project, index) => {
    
    const isFullWidth = (index + 1) % 3 === 0;

    return (
      <div
        key={project._id}
        className={`project-card ${isFullWidth ? "full-width" : "half-width"}`}
      >
        {/* MEDIA RENDERING */}
        {project.media?.mediaType === "image" && project.media.image && (
          <img
            src={urlFor(project.media.image).width(1200).url()}
            alt={project.title}
          />
        )}

        {project.media?.mediaType === "video" && project.media.video && (
          <video
            autoPlay
            muted
            loop
            playsInline
            src={project.media.video.asset.url}
          />
        )}

        <div className="project-meta">
          <h4>{project.title}</h4>
          <p>{project.category}</p>
        </div>
      </div>
    );
  })}
</div> </div>
      </section>



      {/* TESTIMONIALS - redesigned to match provided layout */}
    <section className="testimonials section">
       <div className="testimonial-head">
          <p className="sub-texts">/WHAT DRIVES US</p>
          
        </div>
      <div className="container testimonial-inner">
       
{/* <AnimatedText
  tag="h2"
  className="testimonial-heading scrub-heading"
  text="Over 270 founders have placed their trust in us"
/> */}

<h2 className="testimonial-heading scrub-heading">Over 270 founders have placed their trust in us</h2>
        <div className="testimonial-grid">
    <div className="testimonial-left">
  <div className="portrait large-portrait">
    {leftItem && leftItem.photo ? (
      <img src={urlFor(leftItem.photo).width(1200).url()} alt={leftItem.name} />
    ) : (
      <div className="placeholder" />
    )}

  </div>

  {/* ADD THIS BLOCK */}
  <div className="testimonial-text">
    <h4 className="testimonial-name">/ {leftItem?.name || ""}</h4>
    <small className="testimonial-role">{leftItem?.designation || ""}</small>
    <p className="testimonial-quote">
      {leftItem?.message ? `"${leftItem.message}"` : ""}
    </p>
  </div>

  <div className="testimonial-arrows">
    <button className="arrow-btn" onClick={prev} aria-label="previous">←</button>
    <button className="arrow-btn" onClick={next} aria-label="next">→</button>
  </div>
</div>

          <div className="testimonial-right">
            <div className="right-top">
              <div className="portrait small-portrait">
                {rightItem && rightItem.photo ? (
                  <img src={urlFor(rightItem.photo).width(600).url()} alt={rightItem.name} />
                ) : (
                  <div className="placeholder small" />
                )}
                <div className="badge">{rightItem?.designation?.split(',')?.[1]?.trim() || ''}</div>
              </div>

              <div className="testimonial-text">
                <h4 className="testimonial-name">/ {rightItem?.name || ''}</h4>
                <small className="testimonial-role">{rightItem?.designation || 'designation'}</small>
                <p className="testimonial-quote">{rightItem?.message ? `"${rightItem.message}"` : ''}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile-only simple single-card wrapper: JS will move these into a viewport and animate them. */}
        <div className="homepage-testimonial__cards-wrapper-mobile" aria-hidden="false">
          {data.testimonials?.testimonials?.map((t) => (
            <div key={t._id} className="homepage-testimonial__card-single-mobile">
              <div className="mobile-portrait">
                {t.photo ? (
                  <img src={urlFor(t.photo).width(800).url()} alt={t.name} />
                ) : (
                  <div className="placeholder" />
                )}
              </div>
              <div className="homepage-testimonial__card-content">
                <h4>/ {t.name}</h4>
                <small className="testimonial-role">{t.designation}</small>
                <p className="testimonial-quote">{t.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* INDUSTRIES */}
      {/* <section className="industries section">
        <div className="container">
          <h3>{data.industries?.heading}</h3>

          <div className="industry-grid">
            {data.industries?.industries?.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className="section cta-section-wrapper">
        <div className="cta-section container">
          <h5 className="sub-texts">{data.cta?.heading}</h5>
          <h2 className="cta-text">{data.cta?.subText}</h2>
          <p className="cts-description">{data.cta?.description}</p>
          <a href={data.cta?.buttonLink}>
            <button className="cta-button">{data.cta?.buttonText}</button>
          </a>
        </div>
        <div className="arrow-wrapper"><img src={Arrow} alt="" /></div>
      </section>
      {/* NEWS SECTION */}
{/* INSIGHTS SECTION */}
<section className="news section">
  <div className="container">

    <div className="news-header">
      <p className="news-small sub-texts">/ INSIGHTS</p>
      <h2 className="news-title">Design, tech & people are things we notice, question and occasionally obsessover. Here’s where we unpack them.</h2>
    </div>

    <div className="news-grid">

      {insights.map((item) => (
        <a
          key={item._id}
          href={`/insight/${item.slug.current}`}
          className="news-card"
        >

          {item.featuredImage && (
            <img
              src={urlFor(item.featuredImage).width(900).url()}
              alt={item.title}
              className="news-image"
            />
          )}

          <div className="news-content">

            <div className="band">
            <p>{item.band}</p>
            </div>

            <h4 className="news-small-title">
              {item.title}
            </h4>

          </div>

        </a>
      ))}

    </div>

  </div>
</section>

<section className="section">
  <div className="container doit-container">
    <div className="do-it-once">
      <button><p>Do it once.Do it right</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6H18M18 6V18M18 6L6 18" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
    </div>
  </div>
</section>



    <footer className="wings-footer">
      <div className="wings-footer-inner ">
        <div className="wings-footer-left">
          <div className="footer-contacts">
            <div className="contact-block">
              <small className="muted">General questions</small>
              <a href="mailto:hello@wings.design" className="contact-link">hello@wings.design</a>
            </div>

            <div className="contact-block">
              <small className="muted">Business enquiries</small>
              <a href="mailto:partners@wings.design" className="contact-link">partners@wings.design</a>
            </div>

            <ul className="social-list">
              <li>Instagram</li>
              <li>LinkedIn</li>
              <li>Behance</li>
              <li>Medium</li>
            </ul>

            <div className="ai-row">
              <span>Ask AI about Wings</span>
              <span className="ai-icons" aria-hidden="true">⚙️ • ◦</span>
            </div>

            <div className="explore">Explore Services, Industries, Locations... <span className="arrow">↓</span></div>
          </div>
        </div>

        <div className="wings-footer-right">
          <div className="stripes" aria-hidden="true">
            {/* create the striped area with repeating linear gradient in CSS */}
            <img src={Footerlogo} alt="Wings" className="stripes-logo" />
          </div>
        
        <div className="footer-content">
          <div className="right-caption">Creative Studio for<br/>Immersive Experience</div>
          <div className="copyright">© 2016—{new Date().getFullYear()} Tefiti</div>
        </div>
       
        </div>
      </div>
    </footer>
    </>
  );
}
                                                                                                                                                                                                                        