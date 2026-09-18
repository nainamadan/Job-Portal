import React from "react";
import Image from "next/image";
import FooterVideo from "./components/FooterVideo";

export default function Home() {
  return (
    <footer className="footer-wrapper">
      {/* Interactive Background Character Video */}
      <FooterVideo />

      {/* Main Foreground Content Overlay */}
      <div className="footer-content">
        <div className="desktop-grid">
          {/* Column 1: Headline & Branding */}
          <div className="col-1">
            <span className="badge">CREATIVE STUDIO</span>
            <h1 className="heading-large">
              CRAFTING<br />
              DIGITAL<br />
              REALITIES
            </h1>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="col-2">
            <span className="badge">EXPLORE</span>
            <ul className="nav-list">
              <li><a href="#work" className="nav-link">Selected Work</a></li>
              <li><a href="#about" className="nav-link">About Studio</a></li>
              <li><a href="#services" className="nav-link">Capabilities</a></li>
              <li><a href="#insights" className="nav-link">Journal & Insights</a></li>
              <li><a href="#careers" className="nav-link">Careers — We're Hiring</a></li>
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div className="col-3">
            <span className="badge">CONNECT</span>
            <div className="contact-box">
              <a href="mailto:hello@creativestudio.com" className="contact-email">
                hello@creativestudio.com
              </a>
              <div className="contact-address">
                740 Broadway, 10th Floor<br />
                New York, NY 10003<br />
                United States
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar Footer Info */}
        <div className="bottom-bar">
          <div className="brand-logo-container">
            <Image
              src="/logo.svg"
              alt="Creative Studio Logo"
              width={36}
              height={36}
              priority
            />
            <span style={{ fontSize: "0.9rem", fontWeight: 500, opacity: 0.7 }}>
              © {new Date().getFullYear()} Creative Studio Inc. All rights reserved.
            </span>
          </div>

          <div className="social-links">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="LinkedIn"
            >
              <Image src="/linkedin.svg" alt="LinkedIn" width={18} height={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Instagram"
            >
              <Image src="/instagram.svg" alt="Instagram" width={18} height={18} />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="TikTok"
            >
              <Image src="/tiktok.svg" alt="TikTok" width={18} height={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
