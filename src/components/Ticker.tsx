import { useEffect, useRef } from 'react';
import './ticker-animation.css';

export const Ticker = ({
  reverse = false,
  posts,
}: {
  reverse?: boolean;
  posts: { id: number; title: string; path: string }[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      const scrollWidth = scrollElement.scrollWidth;
      const animationDuration = scrollWidth / 50; // Adjust speed here

      scrollElement.style.animation = `${reverse ? 'scroll-reverse' : 'scroll'} ${animationDuration}s linear infinite`;
    }
  }, []);

  return (
    <div className='relative w-full overflow-hidden bg-gray-50'>
      <div
        ref={scrollRef}
        className='flex whitespace-nowrap'
        style={{
          width: 'fit-content',
        }}
      >
        {[...posts, ...posts].map((item, index) => (
          <a
            href={item.path}
            key={index}
            target='_blank'
            style={{ height: 50 }}
            className='font-light carousel-item text-sm bg-white text-gray-500 flex items-center rounded-2xl border-gray-200 border px-7 py-4 mx-2 shadow-sm'
          >
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
};
