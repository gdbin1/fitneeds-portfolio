import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './FAQ.css';

function FAQ() {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqData = [
    {
      id: 1,
      category: 'Account & Billing',
      title: 'How do I create an account?',
      content: 'You can create an account by clicking on the "Sign Up" button in the top right corner of the page. Fill in your email address, password, and other required information, then click "Create Account".',
      date: '2024-01-15',
      views: 1234
    },
    {
      id: 2,
      category: 'Account & Billing',
      title: 'How do I update my billing information?',
      content: 'To update your billing information, go to your account settings and click on "Billing". From there, you can update your credit card information, billing address, and payment method.',
      date: '2024-01-14',
      views: 892
    },
    {
      id: 3,
      category: 'Account & Billing',
      title: 'What payment methods do you accept?',
      content: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our payment gateway.',
      date: '2024-01-13',
      views: 567
    },
    {
      id: 4,
      category: 'Website Issues',
      title: 'The website is not loading properly',
      content: 'If you are experiencing issues with the website not loading, please try clearing your browser cache and cookies. You can also try using a different browser or device. If the problem persists, please contact our support team.',
      date: '2024-01-12',
      views: 2341
    },
    {
      id: 5,
      category: 'Website Issues',
      title: 'How do I reset my password?',
      content: 'To reset your password, click on "Forgot Password" on the login page. Enter your email address and you will receive a password reset link. Click the link in the email to create a new password.',
      date: '2024-01-11',
      views: 1456
    },
    {
      id: 6,
      category: 'Website Issues',
      title: 'Why am I seeing error messages?',
      content: 'Error messages can occur for various reasons. Common causes include network connectivity issues, browser compatibility problems, or temporary server maintenance. Please check your internet connection and try again. If the error persists, contact support with the specific error message you are seeing.',
      date: '2024-01-10',
      views: 789
    }
  ];

  const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <>
      <Helmet>
        <title>FAQ - FITNEEDS</title>
        <meta name="description" content="Frequently asked questions" />
      </Helmet>
      {/* Header*/}
        <header className="section-padding">
          <div className="section-container">
            <div className="section-row">
              <div className="section-col section-col-header">
                <div className="page-header">
                  <h1 className="page-title">Frequently Asked Questions</h1>
                  <p className="page-subtitle">How can we help you?</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* FAQ Content*/}
        <section className="section-padding section-light">
          <div className="section-container">
            <div className="section-row">
              <div className="section-col section-col-text">
                {/* Board Header */}
                <div className="board-header">
                  <div className="board-header-item board-number">번호</div>
                  <div className="board-header-item board-category">카테고리</div>
                  <div className="board-header-item board-title">제목</div>
                  <div className="board-header-item board-date">작성일</div>
                  <div className="board-header-item board-views">조회</div>
                </div>
                {/* Board List */}
                <div className="board-list">
                  {faqData.map((item, index) => (
                    <div key={item.id} className="board-item">
                      <div className="board-item-row" onClick={() => toggleItem(item.id)}>
                        <div className="board-item-cell board-number">{faqData.length - index}</div>
                        <div className="board-item-cell board-category">
                          <span className="category-badge">{item.category}</span>
                        </div>
                        <div className="board-item-cell board-title">{item.title}</div>
                        <div className="board-item-cell board-date">{item.date}</div>
                        <div className="board-item-cell board-views">{item.views.toLocaleString()}</div>
                      </div>
                      {expandedItems[item.id] && (
                        <div className="board-item-content">
                          <div className="board-content-text">{item.content}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}

export default FAQ;


