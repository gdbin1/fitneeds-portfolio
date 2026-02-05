import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-main">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-copyright">
            <div className="footer-text">Copyright &copy; FITNEEDS 2023</div>
          </div>
          <div className="footer-links">
            <a className="footer-link" href="#!">Privacy</a>
            <span className="footer-separator">&middot;</span>
            <a className="footer-link" href="#!">Terms</a>
            <span className="footer-separator">&middot;</span>
            <a className="footer-link" href="#!">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


