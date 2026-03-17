import React from "react";
import Footerlogo from "../assets/Images/Wings-footer-1.svg";
import "./styles.css";

export default function Footer() {
  return (
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

          <div className="right-caption">Creative Studio for<br/>Immersive Experience</div>

          <div className="copyright">© 2016—{new Date().getFullYear()} Tefiti</div>
        </div>
      </div>
    </footer>
  );
}
