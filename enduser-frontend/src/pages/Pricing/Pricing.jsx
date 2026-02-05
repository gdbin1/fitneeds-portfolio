import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Pricing.css';

function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing - FITNEEDS</title>
        <meta name="description" content="View our pricing plans" />
      </Helmet>
      {/* Pricing section*/}
        <section className="section-padding section-light">
          <div className="section-container">
            <div className="pricing-header">
              <h1 className="pricing-title">Pay as you grow</h1>
              <p className="pricing-subtitle">With our no hassle pricing plans</p>
            </div>
            <div className="pricing-grid">
              {/* Pricing card free*/}
              <div className="pricing-card">
                <div className="pricing-body">
                  <div className="pricing-plan">Free</div>
                  <div className="pricing-price">
                    <span className="pricing-amount">$0</span>
                    <span className="pricing-period">/ mo.</span>
                  </div>
                  <ul className="pricing-features">
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      <strong>1 users</strong>
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      5GB storage
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Unlimited public projects
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Community access
                    </li>
                    <li className="pricing-feature pricing-feature-excluded">
                      <i className="bi bi-x"></i>
                      Unlimited private projects
                    </li>
                    <li className="pricing-feature pricing-feature-excluded">
                      <i className="bi bi-x"></i>
                      Dedicated support
                    </li>
                    <li className="pricing-feature pricing-feature-excluded">
                      <i className="bi bi-x"></i>
                      Free linked domain
                    </li>
                    <li className="pricing-feature pricing-feature-excluded">
                      <i className="bi bi-x"></i>
                      Monthly status reports
                    </li>
                  </ul>
                  <div className="pricing-button">
                    <a className="button-outline-primary" href="#!">Choose plan</a>
                  </div>
                </div>
              </div>
              {/* Pricing card pro*/}
              <div className="pricing-card pricing-card-featured">
                <div className="pricing-body">
                  <div className="pricing-plan">
                    <i className="bi bi-star-fill"></i>
                    Pro
                  </div>
                  <div className="pricing-price">
                    <span className="pricing-amount">$9</span>
                    <span className="pricing-period">/ mo.</span>
                  </div>
                  <ul className="pricing-features">
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      <strong>5 users</strong>
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      5GB storage
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Unlimited public projects
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Community access
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Unlimited private projects
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Dedicated support
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Free linked domain
                    </li>
                    <li className="pricing-feature pricing-feature-excluded">
                      <i className="bi bi-x"></i>
                      Monthly status reports
                    </li>
                  </ul>
                  <div className="pricing-button">
                    <a className="button-primary" href="#!">Choose plan</a>
                  </div>
                </div>
              </div>
              {/* Pricing card enterprise*/}
              <div className="pricing-card">
                <div className="pricing-body">
                  <div className="pricing-plan">Enterprise</div>
                  <div className="pricing-price">
                    <span className="pricing-amount">$49</span>
                    <span className="pricing-period">/ mo.</span>
                  </div>
                  <ul className="pricing-features">
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      <strong>Unlimited users</strong>
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      5GB storage
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Unlimited public projects
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Community access
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Unlimited private projects
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Dedicated support
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      <strong>Unlimited</strong> linked domains
                    </li>
                    <li className="pricing-feature pricing-feature-included">
                      <i className="bi bi-check"></i>
                      Monthly status reports
                    </li>
                  </ul>
                  <div className="pricing-button">
                    <a className="button-outline-primary" href="#!">Choose plan</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}

export default Pricing;


