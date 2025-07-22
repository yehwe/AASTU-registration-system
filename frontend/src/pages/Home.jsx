import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/aastu-logo.png';
import img1 from '../assets/aastu1.jpg';
import img2 from '../assets/aastu2.jpg';
import img3 from '../assets/aastu3.jpg';
import '../index.css';

const images = [img1, img2, img3];

const Home = () => {
  const [current, setCurrent] = useState(0);

  // Auto-play effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Manual navigation
  const goTo = (idx) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const next = () => setCurrent((prev) => (prev + 1) % images.length);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background Image and Overlay (for Home section only) */}
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`AASTU Slide ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${current === idx ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
          style={{ transitionProperty: 'opacity' }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-yellow-900/30 to-black/60 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 py-8">
        {/* Welcome Section */}
        <img
          src={logo}
          alt="AASTU Logo"
          className="h-32 w-32 rounded-full shadow-lg mb-6 animate-bounce bg-white/80 p-2"
          style={{ animationDuration: '2.5s' }}
        />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white animate-fade-in-down drop-shadow-lg" style={{ animationDuration: '1.2s' }}>
          Welcome to <span className="text-white-400">AASTU Registration</span>
        </h1>
        <p className="text-xl md:text-2xl font-bold text-yellow-200 mb-2 animate-fade-in-up drop-shadow" style={{ animationDuration: '1.5s' }}>
          "University for Industry"
        </p>
        <p className="text-lg mb-8 text-white/90 animate-fade-in-up drop-shadow" style={{ animationDuration: '2s' }}>
          Access your dashboard, manage courses, and view your profile with ease.
        </p>
        <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDuration: '2.2s' }}>
          <Link to="/login">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all text-lg font-bold">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full shadow-lg hover:bg-yellow-500 transition-all text-lg font-bold">
              Register
            </button>
          </Link>
        </div>
        {/* Navigation dots */}
        <div className="flex gap-2 mt-8">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-3 h-3 rounded-full border-2 ${current === idx ? 'bg-yellow-400 border-yellow-500' : 'bg-white border-gray-300'} transition-all`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        {/* Prev/Next buttons */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-yellow-400 text-gray-700 rounded-full p-2 shadow z-30 transition-all">
          &#8592;
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-yellow-400 text-gray-700 rounded-full p-2 shadow z-30 transition-all">
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default Home;
