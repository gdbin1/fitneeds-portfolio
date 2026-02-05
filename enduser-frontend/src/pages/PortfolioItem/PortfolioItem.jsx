import React from 'react';
import { Helmet } from 'react-helmet-async';
import './PortfolioItem.css';

function PortfolioItem() {
  return (
    <>
      <Helmet>
        <title>Portfolio Item - FITNEEDS</title>
        <meta name="description" content="View portfolio item details" />
      </Helmet>
      {/* Page Content*/}
        <section className="section-padding">
          <div className="section-container">
            <div className="section-row">
              <div className="section-col section-col-header">
                <div className="portfolio-header">
                  <h1 className="portfolio-title">Project Title</h1>
                  <p className="portfolio-subtitle">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab similique, ducimus ut alias sit accusamus illum, asperiores deserunt dolorum quaerat qui! Ab, quisquam explicabo magni dolores unde beatae quam a.</p>
                </div>
              </div>
            </div>
            <div className="section-row">
              <div className="section-col section-col-full">
                <img className="portfolio-image portfolio-image-large" src="https://dummyimage.com/1300x700/343a40/6c757d" alt="..." />
              </div>
              <div className="section-col section-col-half">
                <img className="portfolio-image" src="https://dummyimage.com/600x400/343a40/6c757d" alt="..." />
              </div>
              <div className="section-col section-col-half">
                <img className="portfolio-image" src="https://dummyimage.com/600x400/343a40/6c757d" alt="..." />
              </div>
            </div>
            <div className="section-row">
              <div className="section-col section-col-header">
                <div className="portfolio-footer">
                  <p className="portfolio-description">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Totam deserunt architecto enim eos accusantium fugit recusandae illo iste dignissimos possimus facere ducimus odit voluptatibus exercitationem, ex laudantium illum voluptatum corporis.</p>
                  <a className="portfolio-link" href="#!">
                    View project
                    <i className="bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}

export default PortfolioItem;


