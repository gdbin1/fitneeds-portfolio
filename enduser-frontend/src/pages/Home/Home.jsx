import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './Home.css';

function Home() {
  const [cardsPerView, setCardsPerView] = useState(3);
  const [testimonialSlide, setTestimonialSlide] = useState(0);
  const [activeWrapper, setActiveWrapper] = useState(1);
  const [animatedTitles, setAnimatedTitles] = useState({
    brandTitle: false,
    solutionTitle: false,
    newsTitle: false
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  const testimonialItems = [
    {
      id: 0,
      text: "요가 수업을 시작한 지 3개월이 되었는데, 몸의 유연성이 정말 많이 좋아졌어요. 김강사님의 세심한 지도 덕분에 부상 없이 안전하게 운동할 수 있었습니다. 앞으로도 꾸준히 다닐 예정입니다!",
      author: "김○○님",
      info: "요가 수업 이용 중"
    },
    {
      id: 1,
      text: "필라테스로 코어 강화를 목표로 시작했는데, 생각보다 효과가 빨리 나타나서 놀랐어요. 이강사님의 맞춤형 프로그램이 정말 좋았습니다.",
      author: "이○○님",
      info: "필라테스 수업 이용 중"
    },
    {
      id: 2,
      text: "헬스 트레이닝으로 체중 감량과 근력 향상을 동시에 달성했습니다. 박강사님의 과학적인 운동 프로그램 덕분에 목표를 빠르게 달성할 수 있었어요.",
      author: "박○○님",
      info: "헬스 트레이닝 이용 중"
    },
    {
      id: 3,
      text: "예약 시스템이 정말 편리해요! 원하는 시간에 쉽게 예약할 수 있고, 강사진도 모두 전문적이어서 만족스럽습니다.",
      author: "최○○님",
      info: "다양한 수업 이용 중"
    },
    {
      id: 4,
      text: "크로스핏 수업을 통해 체력이 정말 많이 향상되었어요. 강사님의 동기부여와 체계적인 프로그램 덕분에 꾸준히 운동할 수 있었습니다.",
      author: "정○○님",
      info: "크로스핏 수업 이용 중"
    },
    {
      id: 5,
      text: "댄스 수업이 너무 재미있어요! 운동이 즐거워서 시간 가는 줄 모르겠습니다. 강사님의 친절한 지도 덕분에 초보자도 쉽게 따라할 수 있어요.",
      author: "강○○님",
      info: "댄스 수업 이용 중"
    }
  ];

  // Update cards per view based on screen size
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth <= 768) {
        setCardsPerView(1);
      } else if (window.innerWidth <= 992) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Update testimonial cards per view based on screen size
  const [testimonialCardsPerView, setTestimonialCardsPerView] = useState(3);

  useEffect(() => {
    const updateTestimonialCardsPerView = () => {
      if (window.innerWidth <= 768) {
        setTestimonialCardsPerView(1);
      } else if (window.innerWidth <= 992) {
        setTestimonialCardsPerView(2);
      } else {
        setTestimonialCardsPerView(3);
      }
    };

    updateTestimonialCardsPerView();
    window.addEventListener('resize', updateTestimonialCardsPerView);
    return () => window.removeEventListener('resize', updateTestimonialCardsPerView);
  }, []);

  // Wrapper scroll effect - Intersection Observer 사용 (Channel Classic부터 GymGround P.T Studio까지)
  useEffect(() => {
    const containers = document.querySelectorAll('.brand-detail-container');
    const maxWrapperIndex = 4; // GymGround P.T Studio까지만
    const minWrapperIndex = 1; // Channel Classic부터 시작
    
    // 초기 상태: 래퍼 효과 비활성화
    setActiveWrapper(0);
    
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const wrapper = container.querySelector('.brand-detail-wrapper');
          if (wrapper) {
            const wrapperIndex = Array.from(containers).indexOf(container) + 1;
            // Channel Classic(1번째)부터 GymGround P.T Studio(4번째)까지만 래퍼 효과 적용
            if (wrapperIndex >= minWrapperIndex && wrapperIndex <= maxWrapperIndex) {
              setActiveWrapper(wrapperIndex);
            } else {
              setActiveWrapper(0);
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    containers.forEach((container) => {
      observer.observe(container);
    });

    // 스크롤 이벤트로 Channel Classic 이전과 GymGround P.T Studio 이후 확인
    const handleScroll = () => {
      const firstContainer = containers[0]; // Channel Classic
      const lastContainer = containers[3]; // GymGround P.T Studio
      
      // Channel Classic 이전에 있으면 래퍼 효과 비활성화
      if (firstContainer) {
        const firstRect = firstContainer.getBoundingClientRect();
        if (firstRect.top > window.innerHeight * 0.5) {
          setActiveWrapper(0);
          return;
        }
      }
      
      // GymGround P.T Studio 이후에 있으면 래퍼 효과 비활성화
      if (lastContainer) {
        const lastRect = lastContainer.getBoundingClientRect();
        if (lastRect.bottom < window.innerHeight * 0.3) {
          setActiveWrapper(0);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 체크

    return () => {
      containers.forEach((container) => {
        observer.unobserve(container);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleTestimonialSlide = (direction) => {
    const maxSlide = Math.max(0, testimonialItems.length - testimonialCardsPerView);
    if (direction === 'next') {
      setTestimonialSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    } else {
      setTestimonialSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
    }
  };

  // Auto slide for testimonials section
  useEffect(() => {
    const maxSlide = Math.max(0, testimonialItems.length - testimonialCardsPerView);
    if (maxSlide === 0) return; // No need to slide if all items fit

    const autoTestimonialInterval = setInterval(() => {
      setTestimonialSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 4000); // Change slide every 4 seconds

    return () => {
      clearInterval(autoTestimonialInterval);
    };
  }, [testimonialItems.length, testimonialCardsPerView]);

  // Calculate transform percentage for testimonials
  const getTestimonialTransformPercentage = () => {
    return (100 / testimonialCardsPerView) * testimonialSlide;
  };

  // Set CSS variable for testimonial cards per view
  useEffect(() => {
    document.documentElement.style.setProperty('--testimonial-cards-per-view', testimonialCardsPerView);
  }, [testimonialCardsPerView]);

  // FitSignal counter animation
  useEffect(() => {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const animateCounter = (element, target) => {
      let current = 0;
      const increment = target / 100;
      const duration = 2000; // 2 seconds
      const stepTime = duration / 100;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current);
      }, stepTime);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.fitsignal-count');
          counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (!counter.classList.contains('counted')) {
              counter.classList.add('counted');
              animateCounter(counter, target);
            }
          });
        }
      });
    }, observerOptions);

    const fitsignalSection = document.querySelector('.fitsignal-section');
    if (fitsignalSection) {
      observer.observe(fitsignalSection);
    }

    return () => {
      if (fitsignalSection) {
        observer.unobserve(fitsignalSection);
      }
    };
  }, []);

  // 제목 날아오기 애니메이션
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          if (element.classList.contains('brand-title')) {
            setAnimatedTitles(prev => ({ ...prev, brandTitle: true }));
          } else if (element.classList.contains('solution-support-title')) {
            setAnimatedTitles(prev => ({ ...prev, solutionTitle: true }));
          } else if (element.classList.contains('news-title')) {
            setAnimatedTitles(prev => ({ ...prev, newsTitle: true }));
          }
        }
      });
    }, observerOptions);

    const brandTitle = document.querySelector('.brand-title');
    const solutionTitle = document.querySelector('.solution-support-title');
    const newsTitle = document.querySelector('.news-title');

    if (brandTitle) observer.observe(brandTitle);
    if (solutionTitle) observer.observe(solutionTitle);
    if (newsTitle) observer.observe(newsTitle);

    return () => {
      if (brandTitle) observer.unobserve(brandTitle);
      if (solutionTitle) observer.unobserve(solutionTitle);
      if (newsTitle) observer.unobserve(newsTitle);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>FITNEEDS - 메인</title>
        <meta name="description" content="FITNEEDS - 원하는 지역의 쉽고 빠른 예약 가능" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="hero-section">
        <iframe
          className="hero-video"
          src="https://www.youtube.com/embed/V5CT-6N7Hp4?autoplay=1&loop=1&mute=1&playlist=V5CT-6N7Hp4&controls=0&modestbranding=1&rel=0&playsinline=1"
          title="Hero Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">

        </div>
      </section>

      {/* Brand Section */}
      <section className="brand-section">
        <div className="section-container">
          <div className="brand-content">
            <div className="brand-line"></div>
            <h2 className={`brand-title animate-on-scroll ${animatedTitles.brandTitle ? 'animated' : ''}`}>OUR BRAND</h2>
            <p className="brand-description">
              편리한 예약부터 유연한 이용권 거래까지<br />
              당신의 피트니스 라이프를 완성합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Detail Section 1 - BodyChannel Classic */}
      <div className="brand-detail-container">
        <section className={`brand-detail-wrapper brand-detail-wrapper-1 ${activeWrapper === 1 ? 'active' : ''}`}>
          <div className="brand-detail-section">
          <div className="brand-detail-content-wrapper">
            <div className="brand-border-top-short"></div>
            <div className="brand-border-top-long"></div>
            <div className="brand-detail-content">
              <div className="brand-detail-label">fully ready.</div>
              <div className="brand-detail-title-wrapper">
                <h3 className="brand-detail-title">Membership Trading</h3>
                <div className="brand-detail-title-line"></div>
              </div>
              <p className="brand-detail-text">
                사용자간 이용권을 안전하고 편리하게 거래할 수 있는 플랫폼을 제공합니다. 미사용 이용권을 판매하거나 필요한 이용권을 구매하여 더욱 유연하게 피트니스 서비스를 이용할 수 있습니다. 검증된 거래 시스템을 통해 신뢰할 수 있는 거래를 지원합니다.
              </p>
              <a href="/about" className="brand-read-more">READ MORE <i className="bi bi-arrow-right"></i></a>
            </div>
            <div className="brand-border-right-short"></div>
          </div>
          <div className="brand-detail-media">
            <iframe
              className="brand-video"
              src="https://www.youtube.com/embed/_usLzlJWdLU?autoplay=1&loop=1&mute=1&playlist=_usLzlJWdLU&controls=0&modestbranding=1&rel=0&playsinline=1"
              title="Chat Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          </div>
        </section>
      </div>

      {/* Brand Detail Section 2 - BodyChannel Urban */}
      <div className="brand-detail-container">
        <section className={`brand-detail-wrapper brand-detail-wrapper-2 ${activeWrapper === 2 ? 'active' : ''}`}>
          <div className="brand-detail-section">
          <div className="brand-detail-media">
            <img 
              src="/images/main/1.jpg" 
              alt="BodyChannel Urban" 
              className="brand-image"
            />
          </div>
          <div className="brand-detail-content-wrapper">
            <div className="brand-border-top-short"></div>
            <div className="brand-border-top-long"></div>
            <div className="brand-detail-content">
              <div className="brand-detail-label">smart and compact.</div>
              <div className="brand-detail-title-wrapper">
                <h3 className="brand-detail-title">Optimal Distance</h3>
                <div className="brand-detail-title-line"></div>
              </div>
              <p className="brand-detail-text">
                주거지와 가까운 최적의 거리에 위치한 피트니스 센터를 찾아보세요. 일상 속에서 쉽게 접근할 수 있는 위치에 있어 꾸준한 운동 습관을 만들기에 최적의 환경을 제공합니다. 집이나 직장에서 가까운 거리의 센터를 선택하여 시간을 효율적으로 활용하고 운동의 지속성을 높일 수 있습니다. 실시간 거리 정보와 교통편 정보를 제공하여 가장 편리한 센터를 선택할 수 있도록 도와드립니다.
              </p>
              <a href="/about" className="brand-read-more">READ MORE <i className="bi bi-arrow-right"></i></a>
            </div>
            <div className="brand-border-right-short"></div>
          </div>
          </div>
        </section>
      </div>

      {/* Brand Detail Section 3 - BodyChannel Urban (Image Right) */}
      <div className="brand-detail-container">
        <section className={`brand-detail-wrapper brand-detail-wrapper-3 ${activeWrapper === 3 ? 'active' : ''}`}>
          <div className="brand-detail-section">
          <div className="brand-detail-content-wrapper">
            <div className="brand-border-top-short"></div>
            <div className="brand-border-top-long"></div>
            <div className="brand-detail-content">
              <div className="brand-detail-label">smart and compact.</div>
              <div className="brand-detail-title-wrapper">
                <h3 className="brand-detail-title">Various Classes</h3>
                <div className="brand-detail-title-line"></div>
              </div>
              <p className="brand-detail-text">
                다양한 수업 프로그램을 제공하여 회원들의 다양한 운동 목표와 선호도를 충족시킵니다. 요가, 필라테스, 헬스 트레이닝, 크로스핏, 댄스 등 다양한 운동 프로그램을 통해 전신 운동부터 특정 부위 집중 운동까지 선택할 수 있습니다. 전문 강사진의 체계적인 지도와 맞춤형 프로그램으로 효과적이고 안전한 운동을 경험할 수 있습니다.
              </p>
              <a href="/about" className="brand-read-more">READ MORE <i className="bi bi-arrow-right"></i></a>
            </div>
            <div className="brand-border-right-short"></div>
          </div>
          <div className="brand-detail-media">
            <img 
              src="/images/main/2.jpg" 
              alt="BodyChannel Urban" 
              className="brand-image"
            />
          </div>
          </div>
        </section>
      </div>

      {/* Brand Detail Section 4 - GymGround P.T Studio */}
      <div className="brand-detail-container">
        <section className={`brand-detail-wrapper brand-detail-wrapper-4 ${activeWrapper === 4 ? 'active' : ''}`}>
          <div className="brand-detail-section">
          <div className="brand-detail-media">
            <img 
              src="/images/main/3.jpg" 
              alt="GymGround P.T Studio" 
              className="brand-image"
            />
          </div>
          <div className="brand-detail-content-wrapper">
            <div className="brand-border-top-short"></div>
            <div className="brand-border-top-long"></div>
            <div className="brand-detail-content">
              <div className="brand-detail-label">immersive and energizing.</div>
              <div className="brand-detail-title-wrapper">
                <h3 className="brand-detail-title">Easy & Quick Booking</h3>
                <div className="brand-detail-title-line"></div>
              </div>
              <p className="brand-detail-text">
                쉽고 빠른 예약 시스템을 통해 원하는 시간과 수업을 간편하게 예약할 수 있습니다. 나의 운동 현황을 실시간으로 확인하고 관리할 수 있어 운동 계획을 체계적으로 세울 수 있습니다. 간편한 결제 시스템으로 빠르고 안전하게 결제를 완료할 수 있으며, 다양한 결제 수단을 지원하여 편리하게 이용할 수 있습니다.
              </p>
              <a href="/about" className="brand-read-more">READ MORE <i className="bi bi-arrow-right"></i></a>
            </div>
            <div className="brand-border-right-short"></div>
          </div>
          </div>
        </section>
      </div>

      {/* Solution Support Section */}
      <section className="solution-support-section">
        <div className="solution-support-top-line"></div>
        <div className="section-container">
          <div className="solution-support-content">
            <div className="solution-support-label">OUR TRAINERS</div>
            <h2 className={`solution-support-title animate-on-scroll ${animatedTitles.solutionTitle ? 'animated' : ''}`}>
              전문성과 열정을 갖춘 강사진과 함께,
            </h2>
            <h3 className="solution-support-subtitle">
              당신의 목표를 달성하는 최고의 운동 경험
            </h3>
            <p className="solution-support-text">
              각 분야의 전문 자격을 갖춘 강사진이 당신의 운동 목표와 체력 수준에 맞춘 맞춤형 프로그램을 제공합니다.<br />
              요가부터 헬스 트레이닝, 필라테스까지 다양한 운동을 전문가의 지도 아래 안전하고 효과적으로 시작하세요.
            </p>
            <a href="/about" className="solution-support-read-more">
              READ MORE <i className="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Trainer Video Section */}
      <section className="trainer-video-section">
        <div className="trainer-video-container">
          <iframe
            className="trainer-video"
            src="https://www.youtube.com/embed/UIkdYDCEsVo?autoplay=1&loop=1&mute=1&playlist=UIkdYDCEsVo&controls=0&modestbranding=1&rel=0&playsinline=1"
            title="Trainer Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* FitSignal Dashboard Section */}
      <section className="fitsignal-section">
        <div className="section-container">
          <div className="fitsignal-content">
            <div className="fitsignal-brand">FitSignal</div>
            <div className="fitsignal-message">
              <p className="fitsignal-message-line1">지금 이 순간에도, 고객은 FITNEEDS와 함께</p>
              <p className="fitsignal-message-line2">건강을 향해 달리고 있습니다.</p>
            </div>
            <div className="fitsignal-metrics">
              <div className="fitsignal-metric">
                <div className="fitsignal-number">
                  <span className="fitsignal-count" data-target="42">0</span>T
                </div>
                <div className="fitsignal-divider"></div>
                <div className="fitsignal-label">
                  <i className="bi bi-heart-fill"></i>
                  <span>BPM</span>
                </div>
              </div>
              <div className="fitsignal-metric">
                <div className="fitsignal-number">
                  <span className="fitsignal-count" data-target="730">0</span>B
                </div>
                <div className="fitsignal-divider"></div>
                <div className="fitsignal-label">
                  <i className="bi bi-triangle-fill"></i>
                  <span>Kcal</span>
                </div>
              </div>
              <div className="fitsignal-metric">
                <div className="fitsignal-number">
                  <span className="fitsignal-count" data-target="184">0</span>M
                </div>
                <div className="fitsignal-divider"></div>
                <div className="fitsignal-label">
                  <i className="bi bi-clock-fill"></i>
                  <span>TIME</span>
                </div>
              </div>
              <div className="fitsignal-metric">
                <div className="fitsignal-number">
                  <span className="fitsignal-count" data-target="112">0</span>M
                </div>
                <div className="fitsignal-divider"></div>
                <div className="fitsignal-label">
                  <i className="bi bi-arrow-up-circle-fill"></i>
                  <span>SNS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - User Reviews with Slider */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="news-content">
            <div className="news-top-line"></div>
            <div className="news-label">Rieviews</div>
            <h2 className={`news-title animate-on-scroll ${animatedTitles.newsTitle ? 'animated' : ''}`}>
              FITNEEDS는 결과로 증명합니다.
            </h2>
          </div>
          <div className="testimonials-header">
            <p className="testimonials-description">실제 이용자들의 생생한 후기를 확인해보세요. 다양한 운동 프로그램과 전문 강사진을 통해 달성한 변화의 이야기입니다.</p>
          </div>
          <div className="testimonials-slider">
            <button className="testimonial-slider-arrow testimonial-slider-arrow-left" onClick={() => handleTestimonialSlide('prev')}>
              <i className="bi bi-chevron-left"></i>
            </button>
            <div className="testimonials-slider-container">
              <div 
                className="testimonials-slider-track"
                style={{ transform: `translateX(-${getTestimonialTransformPercentage()}%)` }}
              >
                {testimonialItems.map((testimonial) => (
                  <div key={testimonial.id} className="testimonial-card">
                    <div className="testimonial-content">
                      <div className="testimonial-quote">
                        <i className="bi bi-quote"></i>
                      </div>
                      <p className="testimonial-text">
                        "{testimonial.text}"
                      </p>
                      <div className="testimonial-author">
                        <div className="testimonial-author-name">{testimonial.author}</div>
                        <div className="testimonial-author-info">{testimonial.info}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="testimonial-slider-arrow testimonial-slider-arrow-right" onClick={() => handleTestimonialSlide('next')}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Story & Vision Section */}
      <section className="story-vision-section">
        <div className="story-vision-content">
          {/* Title Overlay */}
          <div className="panorama-title-overlay">
            <h2 className="panorama-title">지금 바로 예약하세요!</h2>
          </div>
          {/* Panorama Image Carousel - Two Rows Overlay */}
          <div className="panorama-carousel">
            {/* First Row - Scroll Left */}
            <div className="panorama-row panorama-row-1">
              <div className="panorama-track">
                <div className="panorama-item">
                  <img src="/images/main/c10.png" alt="헬스" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c11.png" alt="헬스" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c2.png" alt="크로스핏" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c4.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c12.png" alt="fit" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c10.png" alt="헬스" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c14.png" alt="헬스" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c15.png" alt="헬스" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c3.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c4.png" alt="요가" />
                </div>
                {/* Duplicate for seamless loop */}
                <div className="panorama-item">
                  <img src="/images/main/c1.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c2.png" alt="크로스핏" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c3.png" alt="요가" />
                </div>
              </div>
            </div>
            {/* Second Row - Scroll Right */}
            <div className="panorama-row panorama-row-2">
              <div className="panorama-track">
                <div className="panorama-item">
                  <img src="/images/main/c5.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c6.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c7.png" alt="크로스핏" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c8.png" alt="그룹요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c9.png" alt="크로스핏" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c1.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c13.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c3.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c4.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c1.png" alt="요가" />
                </div>
                {/* Duplicate for seamless loop */}
                <div className="panorama-item">
                  <img src="/images/main/c5.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c6.png" alt="요가" />
                </div>
                <div className="panorama-item">
                  <img src="/images/main/c7.png" alt="크로스핏" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="section-container">
          <div className="location-header">
            <h2 className="location-title">지점을 선택하고 시작하세요</h2>
          </div>
          
          <div className="location-content">
            <div className="location-search-wrapper">
              <div className="location-search">
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="지점명 또는 주소 입력"
                />
                <button className="search-button" type="button">
                  <i className="bi bi-search"></i>
                </button>
              </div>
              
              <div className="location-count">30개의 지점 검색</div>
              
              <div className="location-list">
                <div 
                  className={`location-item ${selectedLocation === 'suwon-main' ? 'active' : ''}`}
                  onClick={() => setSelectedLocation('suwon-main')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="location-item-header">
                    <div className="location-name">수원본점</div>
                    <div className="location-distance">2 Km</div>
                  </div>
                  <div className="location-address">경기도 수원시 영통구 월드컵로 206</div>
                  <div className="location-phone">031-123-4567</div>
                  <div className="location-buttons">
                    <button className="location-btn location-btn-tour">지점투어</button>
                    <button className="location-btn location-btn-consult">상담</button>
                  </div>
                </div>
                <div 
                  className={`location-item ${selectedLocation === 'yeongtong' ? 'active' : ''}`}
                  onClick={() => setSelectedLocation('yeongtong')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="location-item-header">
                    <div className="location-name">영통점</div>
                    <div className="location-distance">5 Km</div>
                  </div>
                  <div className="location-address">경기도 수원시 영통구 광교로 107</div>
                  <div className="location-phone">031-234-5678</div>
                  <div className="location-buttons">
                    <button className="location-btn location-btn-tour">지점투어</button>
                    <button className="location-btn location-btn-consult">상담</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="location-map">
              <iframe
                src={
                  selectedLocation === 'suwon-main'
                    ? `https://maps.google.com/maps?q=경기도+수원시+영통구+월드컵로+206&hl=ko&z=15&output=embed`
                    : selectedLocation === 'yeongtong'
                    ? `https://maps.google.com/maps?q=경기도+수원시+영통구+광교로+107&hl=ko&z=15&output=embed`
                    : `https://maps.google.com/maps?q=경기도+수원시+영통구&hl=ko&z=13&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="수원 지도"
                key={selectedLocation || 'default'}
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
