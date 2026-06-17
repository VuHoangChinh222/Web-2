import React from 'react';

const VibrantBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#06070B]">
      {/* Glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/15 blur-[120px] animate-blob [animation-delay:4s]" />
      <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-900/15 blur-[100px] animate-blob [animation-delay:8s]" />
      
      {/* Subtle grid pattern overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />
    </div>
  );
};

export default VibrantBackground;
