import React, { useState, useEffect } from "react";
import { writeClient, client, urlFor } from "../sanity/SainityClient";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { DisconnectError } from "@sanity/client";
import "./contact.css";

const services = [
  "Website",
  "Branding",
  "Motion Design",
  "App UX/UI Design",
  "Front-End Dev",
  "SEO & Social Media"
];

const query = `*[_type=="contactPage"][0]{
  contact{
    title,
    contactPerson{
      name,
      email,
      role,
      image
    },
    formHeading,
    formDescription,
    "faqs": faqs[]->{
      question,
      answer
    }
  }
}`;

const Contact = () => {

  const [contactData, setContactData] = useState(null);
  const [selectedService, setSelectedService] = useState("");

  // FAQ accordion state
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    location: "",
    message: ""
  });

  useEffect(() => {
    client.fetch(query).then((data) => {
      setContactData(data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const submissionData = {
      _type: "contactSubmission",
      service: selectedService,
      ...formData,
      submittedAt: new Date().toISOString()
    };

    /* SAVE TO SANITY */
    await writeClient.create(submissionData);

    /* SAVE TO GOOGLE SHEETS */
    try {

await fetch(
  "https://script.google.com/macros/s/AKfycbwIM_rWbFo1WVQgy9YbQgak9zHk1r4dra9YJWvZ1zDnNGx2aQpyZv6ESF33N2CnEnU0/exec",
  {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      role: formData.role,
      location: formData.location,
      message: formData.message,
      service: selectedService
    })
  }
);

    } catch (sheetError) {

      console.error("Google Sheets Error:", sheetError);

    }

    alert("Form submitted successfully");

    setSelectedService("");

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      location: "",
      message: ""
    });

  } catch (error) {

    console.error("Sanity Submission Error:", error);
    alert("Submission failed");

  }
};
if (!contactData) return null;

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="contactus-section section">
        <h2 className="contect-heading">{contactData.contact.title}</h2>
      </section>
<section className="contact-form-section section">
    <div className="contact-form-wrapper">
    {/* CONTACT PERSON */}
    <div className="contact-area">

        <div className="contact-person">
            <h4 className="business">New Business</h4>
               <a className="link-business" href={`mailto:${contactData.contact.contactPerson.email}`}>
                      {contactData.contact.contactPerson.email}
               </a>
        <div className="person-image">

          {contactData.contact.contactPerson.image && (
            <img
              src={urlFor(contactData.contact.contactPerson.image).width(600).url()}
              alt={contactData.contact.contactPerson.name}
            />
          )}
        </div>

        <div className="person-details">
          <h3 className="details-name">{contactData.contact.contactPerson.name}</h3>
          <p className="details-role">{contactData.contact.contactPerson.role}</p>
       
      
          
        </div>
      

      </div>
        <div>
             <h3 className="details-name">Join the team</h3>
                <a className="link-business" href={`mailto:$hello@wings.design`}>
                      hello@wings.design
               </a>
               <p className="detail-small">Please use this email ID for all job application Let’s not send your career to the wrong in box.</p>
        </div>
    </div>
    

      {/* CONTACT FORM */}
      <div className="contact-section">

        <h3 className="contact-label">{contactData.contact.formHeading}</h3>
        <p>{contactData.contact.formDescription}</p>

        <div className="service-buttons">
          {services.map((service) => (
            <button
        
              key={service}
              type="button"
              onClick={() => setSelectedService(service)}
              className={selectedService === service ? "active" : ""}
            >
              {service}
            </button>
          ))}
        </div>

        <form className="form-wrapper" onSubmit={handleSubmit}>
          <label htmlFor="Let’s get to know you" className="contact-label">Let’s get to know you</label>
           <div className="first-wrapper">   <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
          <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} /></div>
       

          <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />

          <input name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} />

          <input name="role" placeholder="Role (Founder, Marketing Head)" value={formData.role} onChange={handleChange} />

          <input name="location" placeholder="Location (City, Country)" value={formData.location} onChange={handleChange} />

          <textarea
            name="message"
           
            placeholder="Go ahead. Do it. Share your concerns. Your thoughts. Your number one wish. A prediction. A funny story. Your latest top 10 of something. Or the next big startup idea we could help with." rows="7"
            value={formData.message}
            onChange={handleChange}
          />

          <button  className="submit-button" type="submit">Let's Move //Forward</button>

        </form>

      </div>
    </div>


</section>
  

      {/* FAQ SECTION */}
   {/* FAQ SECTION */}
<section className="faq-section">

  <div className="faq-header">

    <span className="faq-label">FAQ's</span>

    <h2 className="faq-title">
      Insights worth knowing before
      we begin working together
    </h2>

  </div>

  <div className="faq-list">

    {contactData.contact.faqs.map((faq, index) => (
      <div
        key={index}
        className={`faq-item ${activeFAQ === index ? "open" : ""}`}
      >

        <button
          className="faq-question"
          onClick={() => toggleFAQ(index)}
        >

          <span className="faq-number">
            {(index + 1).toString().padStart(2, "0")}.
          </span>

          <span className="faq-text">
            {faq.question}
          </span>

          <span className="faq-arrow">
            {activeFAQ === index ? "⌃" : "⌄"}
          </span>

        </button>

        <div className="faq-answer">
          <p>{faq.answer}</p>
        </div>

      </div>
    ))}

  </div>

</section>
<section className="section doit-section">
  <div className="container doit-container">
    <div className="do-it-once">
      <button><p>Let's Move // Forward</p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6H18M18 6V18M18 6L6 18" stroke="black" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
    </div>
  </div>
</section>


      <Footer />

    </>
  );
};

export default Contact;






