'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../sidebar/Sidebar';

export default function Home() {
  const calculateTimeLeft = () => {
    const target = new Date('2025-09-01T00:00:00');
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="text-center text-white space-y-6 animate-fade-in">
        <h1 className="text-4xl md:text-8xl font-bold tracking-wide">🚀 Coming Soon</h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-md mx-auto">
          We're working hard to bring something amazing to you. Stay tuned!
        </p>

        {/* New Line: Coming this September */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-4">
          📅 Coming this September
        </h2>

        {/* Countdown Timer */}
        <div className="text-3xl sm:text-4xl font-mono flex justify-center gap-6 mt-2">
          <div>
            <div>{timeLeft.days}</div>
            <div className="text-sm text-gray-400">Days</div>
          </div>
          <div>
            <div>{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-sm text-gray-400">Hours</div>
          </div>
          <div>
            <div>{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-sm text-gray-400">Minutes</div>
          </div>
          <div>
            <div>{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-sm text-gray-400">Seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
}
