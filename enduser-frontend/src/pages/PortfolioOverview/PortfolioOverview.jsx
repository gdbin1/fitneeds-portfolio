import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './PortfolioOverview.css';

function PortfolioOverview() {
  return (
    <>
      <Helmet>
        <title>Portfolio - FITNEEDS</title>
        <meta name="description" content="View our portfolio" />
      </Helmet>
      {/* Page Content*/}
        <section className="section-padding">
          <div className="section-container">
            <div className="portfolio-header">
              <h1 className="portfolio-title">Our Work</h1>
              <p className="portfolio-subtitle">Company portfolio</p>
            </div>
            <div className="portfolio-grid">
              <div className="portfolio-item">
                <img className="portfolio-image" src="https://dummyimage.com/600x400/343a40/6c757d" alt="..." />
                <Link className="portfolio-link" to="/portfolio/item">Project name</Link>
              </div>
              <div className="portfolio-item">
                <img className="portfolio-image" src="https://dummyimage.com/600x400/343a40/6c757d" alt="..." />
                <Link className="portfolio-link" to="/portfolio/item">Project name</Link>
              </div>
              <div className="portfolio-item">
                <img className="portfolio-image" src="https://dummyimage.com/600x400/343a40/6c757d" alt="..." />
                <Link className="portfolio-link" to="/portfolio/item">Project name</Link>
              </div>
              <div className="portfolio-item">
                <img className="portfolio-image" src="https://dummyimage.com/600x400/343a40/6c757d" alt="..." />
                <Link className="portfolio-link" to="/portfolio/item">Project name</Link>
              </div>
            </div>
          </div>
        </section>
        <section className="section-padding section-light">
          <div className="section-container">
            <div className="cta-content">
              <h2 className="cta-title">Let's build something together</h2>
              <Link className="button-primary button-large" to="/contact">Contact us</Link>
            </div>
          </div>
        </section>
    </>
  );
}

export default PortfolioOverview;


