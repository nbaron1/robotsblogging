import { useEffect, useRef, useState } from 'react';

function LoadingIcon() {
  return (
    <svg
      width='17'
      height='17'
      viewBox='0 0 17 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='animate-spin'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9 0.4375C9.41421 0.4375 9.75 0.773286 9.75 1.1875V3.0625C9.75 3.47671 9.41421 3.8125 9 3.8125C8.58579 3.8125 8.25 3.47671 8.25 3.0625V1.1875C8.25 0.773286 8.58579 0.4375 9 0.4375ZM3.31618 2.87618C3.60907 2.58329 4.08395 2.58329 4.37684 2.87618L5.96783 4.46717C6.26072 4.76006 6.26072 5.23494 5.96783 5.52783C5.67494 5.82072 5.20006 5.82072 4.90717 5.52783L3.31618 3.93684C3.02329 3.64395 3.02329 3.16907 3.31618 2.87618ZM14.5285 3.03151C14.8214 3.3244 14.8214 3.79928 14.5285 4.09217L13.4678 5.15283C13.1749 5.44572 12.7001 5.44572 12.4072 5.15283C12.1143 4.85994 12.1143 4.38506 12.4072 4.09217L13.4678 3.03151C13.7607 2.73862 14.2356 2.73862 14.5285 3.03151ZM0.9375 8.5C0.9375 8.08579 1.27329 7.75 1.6875 7.75H4.3125C4.72671 7.75 5.0625 8.08579 5.0625 8.5C5.0625 8.91421 4.72671 9.25 4.3125 9.25H1.6875C1.27329 9.25 0.9375 8.91421 0.9375 8.5ZM14.0625 8.5C14.0625 8.08579 14.3983 7.75 14.8125 7.75H15.9375C16.3517 7.75 16.6875 8.08579 16.6875 8.5C16.6875 8.91421 16.3517 9.25 15.9375 9.25H14.8125C14.3983 9.25 14.0625 8.91421 14.0625 8.5ZM6.34283 11.1572C6.63572 11.4501 6.63572 11.9249 6.34283 12.2178L4.22151 14.3392C3.92862 14.632 3.45374 14.632 3.16085 14.3392C2.86796 14.0463 2.86796 13.5714 3.16085 13.2785L5.28217 11.1572C5.57506 10.8643 6.04994 10.8643 6.34283 11.1572ZM12.7822 12.2822C13.0751 11.9893 13.5499 11.9893 13.8428 12.2822L14.3732 12.8125C14.6661 13.1054 14.6661 13.5803 14.3732 13.8732C14.0803 14.1661 13.6054 14.1661 13.3125 13.8732L12.7822 13.3428C12.4893 13.0499 12.4893 12.5751 12.7822 12.2822ZM9 12.25C9.41421 12.25 9.75 12.5858 9.75 13V16C9.75 16.4142 9.41421 16.75 9 16.75C8.58579 16.75 8.25 16.4142 8.25 16V13C8.25 12.5858 8.58579 12.25 9 12.25Z'
        fill='#44403C'
      />
    </svg>
  );
}

function Checkmark() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M17.2559 4.41205C17.5814 4.73748 17.5814 5.26512 17.2559 5.59056L8.08926 14.7572C7.76382 15.0827 7.23618 15.0827 6.91074 14.7572L2.74408 10.5906C2.41864 10.2651 2.41864 9.73748 2.74408 9.41205C3.06951 9.08661 3.59715 9.08661 3.92259 9.41205L7.5 12.9895L16.0774 4.41205C16.4028 4.08661 16.9305 4.08661 17.2559 4.41205Z'
        fill='#4ADE80'
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.7803 3.96967C12.0732 4.26256 12.0732 4.73744 11.7803 5.03033L7.81066 9L11.7803 12.9697C12.0732 13.2626 12.0732 13.7374 11.7803 14.0303C11.4874 14.3232 11.0126 14.3232 10.7197 14.0303L6.21967 9.53033C5.92678 9.23744 5.92678 8.76256 6.21967 8.46967L10.7197 3.96967C11.0126 3.67678 11.4874 3.67678 11.7803 3.96967Z'
        fill='#292524'
      />
    </svg>
  );
}

type MessagePayload =
  | {
      step: number;
      completed: boolean;
      message: string;
      type: 'progress';
    }
  | {
      type: 'final';
      path: string;
    };

type CreatePostPayload = {
  slug: string;
  topic: string;
  length: string;
  token: string;
};

export function GeneratingPage() {
  const [messages, setMessages] = useState<
    { message: string; completed: boolean }[]
  >([]);
  const hasLoadedRef = useRef(false);

  const createPost = async ({
    slug,
    topic,
    length,
    token,
  }: CreatePostPayload) => {
    try {
      const result = await fetch('/api/v1/pages', {
        method: 'POST',
        body: JSON.stringify({ slug, topic, length, token }),
      });

      if (!result.ok) {
        throw new Error('Failed to create post');
      }

      const data = await result.json();
    } catch (error) {
      const oneSecond = new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      await oneSecond;

      return createPost({ length, slug, topic, token });
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;

    const url = new URL(window.location.href);

    const slug = url.searchParams.get('slug');
    const topic = url.searchParams.get('topic');
    const length = url.searchParams.get('length');
    const token = url.searchParams.get('token');

    if (!slug || !topic || !length || !token) {
      console.error('Missing slug, topic, length, or token');
      return;
    }

    // const response = await fetch('/api/v1/pages', {
    //   body: JSON.stringify({ slug, topic, length, token }),
    //   method: 'POST',
    // });

    const eventSource = new EventSource(
      `/api/v1/pages?slug=${encodeURIComponent(slug)}&topic=${encodeURIComponent(topic)}&length=${encodeURIComponent(length)}&token=${encodeURIComponent(token)}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data: MessagePayload = JSON.parse(event.data);

        if (data.type === 'final') {
          window.location.href = data.path;
          return;
        }

        setMessages((messages) => {
          const index = data.step - 1;

          const newMessages = [...messages];

          newMessages[index] = {
            message: data.message,
            completed: data.completed,
          };

          return newMessages;
        });
      } catch (error) {}
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };
  });

  return (
    <>
      <div className='flex justify-between items-center'>
        <a href='/' className='flex items-center gap-1'>
          <ChevronLeft />
          <span className='text-gray-900'>home</span>
        </a>
        <p className='text-gray-600 hidden sm:block'>
          an experiment by{' '}
          <a
            href='https://nbaron.com/'
            target='_blank'
            rel='noreferrer'
            className='underline'
          >
            nbaron
          </a>
        </p>
        <p className='text-gray-600 sm:hidden'>
          by{' '}
          <a
            href='https://nbaron.com/'
            target='_blank'
            rel='noreferrer'
            className='underline'
          >
            nbaron
          </a>
        </p>
      </div>
      <div className='flex flex-col items-center gap-6'>
        <h1 className='font-title sm:text-5xl text-gray-900 text-4xl'>
          Generating your post
        </h1>
        <div className='flex flex-col gap-6 mx-auto'>
          {messages.map(({ completed, message }, index) => (
            <div key={index} className='flex gap-3 items-center'>
              {completed ? <Checkmark /> : <LoadingIcon />}
              <p className='text-lg text-gray-900'>{message}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
