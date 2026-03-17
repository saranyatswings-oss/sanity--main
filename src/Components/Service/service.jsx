import React, { useEffect, useState } from "react";
import { client, urlFor } from "../../sanity/SainityClient";
import Navbar from "../Navbar";
import "./service.css";
import Footer from "../Footer";

const query = `
{
  "header": *[_type=="serviceSection"][0]{
    pageHeading,
    pageDescription
  },

  "services": *[_type=="servicesList"] {
    _id,
    serviceName,
    description,
    bannerImage,
    leftHeading,
    leftdescription,
    leftList,
    rightHeading,
    rightdescription,
    rightList
  }
}
`;

function Service() {

  const [data, setData] = useState(null);

  useEffect(() => {
    client.fetch(query).then((res) => {
      setData(res);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}

      <section className="services-hero section">

        <div className="container services-hero-content">

          <h1 className="services-title">
            {data.header?.pageHeading}
          </h1>

          <p className="services-description">
            {data.header?.pageDescription}
          </p>

        </div>

      </section>

      {/* SERVICES LIST */}

      {data.services?.map((service) => (

        <section key={service._id} className="service-block section">

          <div className="container">

            {/* SERVICE NAME */}

          
         

            {/* BANNER IMAGE */}

            {service.bannerImage && (
              <img
                src={urlFor(service.bannerImage).width(1200).url()}
                alt={service.serviceName}
                className="service-image"
              />
            )}

           
            {/* GRID */}
            <div className="inner-service">  <p className="service-label">
              {service.serviceName}
            </p></div>
            <div className="service-grid">

              {/* LEFT SIDE */}

              <div className="service-left">

                <h2 className="service-heading">
                  {service.leftHeading}
                </h2>
        <h5 className="service-label">
                  {service.leftdescription}
                </h5>
                <ul className="service-list">
                  {service.leftList?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

              </div>

              {/* RIGHT SIDE */}

              <div className="service-right">

                <h2 className="service-heading">
                  {service.rightHeading}
                </h2>
                    <h5 className="service-label">
                  {service.rightdescription}
                </h5>

                <ul className="service-list">
                  {service.rightList?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

              </div>

            </div>

          </div>

        </section>
       

      ))}
      <section className="section">
  <div className="container doit-container">
    <div className="do-it-once">
      <button><p>Let's Move // Forward</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6H18M18 6V18M18 6L6 18" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
    </div>
  </div>
</section>
  <Footer />
    </>
  );
}

export default Service;