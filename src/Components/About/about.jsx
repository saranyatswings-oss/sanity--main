import React, { useEffect, useState, useRef } from "react";
import { client, urlFor } from "../../sanity/SainityClient";
import "./about.css";
import Footer from "../Footer";
import Navbar from "../Navbar";

function About() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [counts, setCounts] = useState([]);
  const [hasAnimated, setHasAnimated] = useState(false);

  const counterRef = useRef(null);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await client.fetch(`*[_type == "aboutSection"][0]{
          heroTitle,
          heroDescription,
          parasection,
          parasection2,

          ceoTitle,
          ceoPara1,
          ceoPara2,
          buttonText,
          popupTitle,
          popupPara,
          bannerImage,

          wingssectiontitle,
          wingspara,

          counters[]{
            title,
            number
          },

          cultureSection->{
            cards[]{
              title,
              para,
              buttonText,
              buttonLink,
              image
            }
          }
        }`);

        setData(res);
      } catch (error) {
        console.error("SANITY FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // INTERSECTION OBSERVER
useEffect(() => {
  const handleScroll = () => {
    if (!counterRef.current || hasAnimated) return;

    const rect = counterRef.current.getBoundingClientRect();

    if (rect.top < window.innerHeight - 100) {
      console.log("VISIBLE ✅");
      setHasAnimated(true);
    }
  };

  // run once on load
  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, [hasAnimated]);

  // COUNTER ANIMATION
useEffect(() => {
  if (data?.counters) {
    setCounts(new Array(data.counters.length).fill(0));
  }
}, [data]);

useEffect(() => {
  if (!data?.counters || !hasAnimated || counts.length === 0) return;

  const duration = 1500;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);

    const newCounts = data.counters.map((item) => {
      const end = Number(item.number.replace(/\D/g, "")) || 0;
      return Math.floor(progress * end);
    });

    setCounts(newCounts);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}, [data, hasAnimated, counts.length]); console.log("hasAnimated:", hasAnimated);
useEffect(() => {
  console.log("hasAnimated:", hasAnimated);
}, [hasAnimated]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data found in Sanity</div>;

  return (
    <div>
      <Navbar />

      {/* HERO */}
      <section className="heroabout"data-text="This is tooltip text">
        <div className="titlewrap" data-text="This is tooltip text">
          <h1 className="herotitle">{data.heroTitle}</h1>
        </div>
        <p>{data.heroDescription}</p>
      </section>

      {/* PARAGRAPH */}
      <section className="para-section">
        <div className="para-block">
          <div className="para-wrap">
            <p className="small-para small-para1">{data.parasection}</p>
            <p className="small-para small-para2">{data.parasection2}</p>
          </div>
        </div>
      </section>

      {/* CEO */}
      <section className="ceo-section">
        <div className="ceo-block">
          <h2 className="ceotitle">{data.ceoTitle}</h2>
          <p className="ceo-para">{data.ceoPara1}</p>

          <button onClick={() => setShowPopup(true)}>
            {data.buttonText}
          </button>

          <div className="imgwrap">
            {data.bannerImage && (
              <img
                className="ceo-banner"
                src={urlFor(data.bannerImage).width(1200).url()}
                alt="CEO Banner"
              />
            )}
          </div>

          {showPopup && (
            <div className="popup-overlay" onClick={() => setShowPopup(false)}>
              <div
                className="popup-container"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="popup-close"
                  onClick={() => setShowPopup(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <line
                      x1="0.354"
                      y1="0.357"
                      x2="23.354"
                      y2="23.357"
                      stroke="black"
                    />
                    <line
                      x1="23.354"
                      y1="0.643"
                      x2="0.354"
                      y2="23.643"
                      stroke="black"
                    />
                  </svg>
                </button>

                <div className="popup-content">
                  <p className="popup-text">{data.popupPara}</p>
                  <h2 className="popup-title">{data.popupTitle}</h2>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CULTURE */}
      <section className="culture-section">
        <div className="culture-block">
          <div className="culture-cards" >
            {data?.cultureSection?.cards?.length > 0 ? (
              data.cultureSection.cards.map((card, index) => (
                <div className="culture-card" data-text="This is tooltip text" key={index}>
                  <div className="card-content">
                    <div className="text-wrap">
                      <h3 className="card-title">{card.title}</h3>
                      <p className="card-para">{card.para}</p>
                    </div>

                    {card.buttonText && (
                      <a className="card-btn" href={card.buttonLink || "#"}>
                        {card.buttonText}
                      </a>
                    )}
                  </div>

                  <div className="card-image">
                    {card.image && (
                      <img
                        src={urlFor(card.image).width(800).url()}
                        alt={card.title}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No culture cards found</p>
            )}
          </div>
        </div>
      </section>

      {/* WINGS */}
      <section>
        <div className="wings-block">
          <div className="h2-wrap-wings">
            <h2 className="h2-wings">{data.wingssectiontitle}</h2>
          </div>
          <div className="para-wrap-wings">
            <p className="para-wings">{data.wingspara}</p>
          </div>
        </div>
      </section>

      {/* COUNTER */}
      <section>
        <div className="counter-block" ref={counterRef}>
          {data.counters?.map((counter, index) => (
            <div className="count-wrap" key={index}>
              <p className="count-title">{counter.title}</p>
             <h2 className="count-num">
            <span className="num">{counts[index] ?? 0}</span>
            {counter.number.includes("+") && <span className="plus">+</span>}
          </h2>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
