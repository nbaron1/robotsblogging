import { useEffect, useRef } from 'react';
import './animation.css';

export const Ticker = ({
  reverse = false,
  posts,
}: {
  reverse?: boolean;
  posts: { title: string }[];
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

  const tickerItems = posts.map((post) => post.title);

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
          <a
            href='/'
            key={index}
            style={{ height: 50 }}
            className='font-light carousel-item text-sm bg-white text-gray-500 flex items-center rounded-2xl border-gray-200 border px-7 py-4 mx-2 shadow-sm'
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
};
