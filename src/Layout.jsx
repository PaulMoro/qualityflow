import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        :root {
          --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
          --primary-magenta: #FF1B7E;
          --dark-bg: #0a0a0a;
          --card-bg: #1a1a1a;
          --border-color: #2a2a2a;
        }
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: #0a0a0a;
          color: #ffffff;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb {
          background: #FF1B7E;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #e6156e;
        }
        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Particle background effect */
        .particle-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.3;
          background-image: 
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 60%, white, transparent);
          background-size: 200% 200%;
          animation: particle-drift 20s ease-in-out infinite;
        }
        @keyframes particle-drift {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      `}</style>
      <div className="particle-bg" />
      {children}
    </div>
  );
}