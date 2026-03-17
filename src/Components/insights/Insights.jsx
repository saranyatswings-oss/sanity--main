import React, { useEffect, useState } from "react";
import { client, urlFor } from "../../sanity/SainityClient";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import "./insights.css";

/* FETCH HEADER */
const headerQuery = `
*[_type=="insightsSection"][0]{
  title,
  description
}
`;

/* FETCH ALL INSIGHTS */
const insightsQuery = `
*[_type=="insight"] | order(publishedDate desc){
  _id,
  title,
  slug,
  excerpt,
  readingTime,
  featuredImage
}
`;

const Insights = () => {

  const [header, setHeader] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        const headerData = await client.fetch(headerQuery);
        const insightsData = await client.fetch(insightsQuery);

        setHeader(headerData);
        setInsights(insightsData);

      } catch (error) {

        console.error("Sanity Fetch Error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  /* LOADING STATE */
  if (loading) {
    return <div className="loading">Loading insights...</div>;
  }

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}

      <section className="insights-hero section">

        <div className="container insights-hero-content">

          <h1 className="insights-title">
            {header?.title || "Insights"}
          </h1>

          <p className="insights-description">
            {header?.description || ""}
          </p>

        </div>

      </section>

      {/* INSIGHTS GRID */}

      <section className="insights-list section">

        <div className="container insights-grid">

          {insights.length === 0 && (
            <p>No insights found.</p>
          )}

          {insights.map((item) => {

            const slug = item?.slug?.current;

            return (

              <Link
                key={item._id}
                to={`/insight/${slug}`}
                className="insight-card"
              >

                {item?.featuredImage && (

                  <img
                    src={urlFor(item.featuredImage).width(900).url()}
                    alt={item.title}
                    className="insight-image"
                  />

                )}

                <div className="insight-content">

                  <h3 className="insight-card-title">
                    {item.title}
                  </h3>

                  <p className="insight-excerpt">
                    {item.excerpt}
                  </p>

                </div>

              </Link>

            );

          })}

        </div>

      </section>

      <Footer />
    </>
  );
};

export default Insights;