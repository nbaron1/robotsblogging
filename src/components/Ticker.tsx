import { useEffect, useRef } from 'react';
import './animation.css';
export const Ticker = ({ reverse = false }: { reverse?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  console.log({ reverse });

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      const scrollWidth = scrollElement.scrollWidth;
      const animationDuration = scrollWidth / 50; // Adjust speed here

      scrollElement.style.animation = `${reverse ? 'scroll-reverse' : 'scroll'} ${animationDuration}s linear infinite`;
    }
  }, []);

  const tickerItems = [
    '10 reasons why dogs are great pets',
    'The benefits of daily exercise',
    'How to start a vegetable garden',
    'Top 5 destinations for summer vacation',
    'Easy recipes for busy weeknights',
    'The importance of reading in child development',
    'Tips for reducing stress at work',
    'Best practices for home office setup',
  ];

  return (
    <div className='relative w-full overflow-hidden bg-gray-50'>
      <div
        ref={scrollRef}
        className='flex whitespace-nowrap'
        style={{
          width: 'fit-content',
        }}
      >
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div
            key={index}
            style={{ height: 50 }}
            className='bg-white text-gray-800 flex items-center rounded-2xl border-gray-200 border px-7 py-4 mx-2 shadow-sm'
          >
            <p className='carousel-item text-sm'>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
