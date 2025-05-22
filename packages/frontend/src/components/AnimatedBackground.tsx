import React from 'react';

const AnimatedBackground: React.FC = () => (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: -1,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(270deg, #ff7e5f, #feb47b, #6a82fb, #fc5c7d)',
    backgroundSize: '600% 600%',
    animation: 'gradientBG 16s ease infinite',
  }}>
    <style>
      {`
        @keyframes gradientBG {
          0% {background-position:0% 50%}
          50% {background-position:100% 50%}
          100% {background-position:0% 50%}
        }
      `}
    </style>
  </div>
);

export default AnimatedBackground; 