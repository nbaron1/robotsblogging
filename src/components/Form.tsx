import * as RadioGroup from '@radix-ui/react-radio-group';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { GeneratingContentDialog } from './GeneratingContentDialog';

const getTopicIdea = async (): Promise<string> => {
  try {
    const response = await fetch('/api/v1/topic');

    if (!response.ok) {
      throw new Error('Failed to get topic ideas');
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error('Failed to get topic ideas');
    }

    return json.data;
  } catch (error) {
    const oneSecond = new Promise((resolve) => {
      setTimeout(() => {
        resolve('resolved');
      }, 1000);
    });

    await oneSecond;

    return getTopicIdea();
  }
};

export function Form({ siteKey }: { siteKey: string }) {
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [topic, setTopic] = useState('');
  const [slug, setSlug] = useState('');

  const turnstileRef = useRef<TurnstileInstance>(null);

  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const loadingDataRef = useRef<null | {
    slug: string;
    topic: string;
    length: string;
  }>(null);

  const handleChangeLengthValue = (value: string) => {
    if (value !== 'short' && value !== 'medium' && value !== 'long') return;

    setLength(value);
  };

  useEffect(() => {
    console.log('loaded');
  }, []);

  const postPage = async ({
    length,
    slug,
    token,
    topic,
  }: {
    slug: string;
    topic: string;
    length: string;
    token: string;
  }) => {
    try {
      console.log('Generating post');
      const response = await fetch('/api/v1/pages', {
        body: JSON.stringify({ slug, topic, length, token }),
        method: 'POST',
      });
      console.log('is after response', response);

      if (!response.ok) {
        throw new Error('Failed to create page');
      }
      console.log;
      const data = await response.json();
      console.log({ data });
      if (!data.success) {
        throw new Error('Failed to create page');
      }

      return data;
    } catch (error) {
      console.log('error posting page', error);
      const oneSecond = new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      await oneSecond;

      return postPage({ length, slug, token, topic });
    }
  };

  const handleGenerateNewTopicIdea: React.MouseEventHandler<
    HTMLButtonElement
  > = async (event) => {
    try {
      event.preventDefault();

      const topicIdea = await getTopicIdea();
      console.log({ topicIdea });

      setTopic(topicIdea);

      const updatedSlug = topicIdea.toLowerCase().replaceAll(' ', '-');

      setSlug(updatedSlug);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit: HTMLAttributes<HTMLButtonElement>['onClick'] = async (
    event
  ) => {
    try {
      event.preventDefault();

      if (!turnstileRef.current) {
        return;
      }

      loadingDataRef.current = { slug, topic, length };
      turnstileRef.current.execute();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuccess = useCallback(
    (token: string) => {
      // We need to use a ref value here or else we'll get stale values
      if (!loadingDataRef.current) return;

      const { length, slug, topic } = loadingDataRef.current;
      const slugWithSlash = `/${slug}`;
      turnstileRef.current?.reset();

      setIsGeneratingContent(true);

      postPage({ length, slug: slugWithSlash, token, topic }).then(
        (response) => {
          const {
            data: { slug },
          } = response;

          window.location.href = slug;
        }
      );
    },
    [setIsGeneratingContent, slug, topic, length]
  );

  const handleOpenChange = (open: boolean) => {
    console.log({ open });
    if (!open) {
      setIsGeneratingContent(false);
    }
  };

  return (
    <>
      <GeneratingContentDialog
        onOpenChange={handleOpenChange}
        open={isGeneratingContent}
      />
      <div className='w-full max-w-[500px] mx-auto'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <div className='flex justify-between'>
              <label htmlFor='topic' className='text-gray-700'>
                Topic
              </label>
              <button
                onClick={handleGenerateNewTopicIdea}
                className='text-left font-light text-gray-700'
              >
                <span className='fade-in'>Suggest a topic</span>
              </button>
            </div>
            <input
              id='topic'
              className='border text-gray-700 px-6 outline-none rounded-2xl h-14 bg-gray-50 border-gray-200'
              type='text'
              name='topic'
              placeholder='Write anything here'
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label htmlFor='slug' className='text-gray-600'>
              URL Slug
            </label>
            <div className='relative'>
              <input
                className='w-full border text-gray-700 pl-10 pr-6 outline-none rounded-2xl h-14 bg-gray-50 border-gray-200'
                type='text'
                name='slug'
                placeholder='Write anything here'
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <p className='absolute left-6 top-1/2 -translate-y-1/2 text-gray-300'>
                /
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <p className='text-gray-600'>Length</p>
            <RadioGroup.Root
              value={length}
              onValueChange={handleChangeLengthValue}
              className='flex flex-col sm:flex-row bg-gray-50 border border-gray-200 rounded-2xl p-2 items-start'
            >
              <RadioGroup.Item
                value='short'
                className='flex justify-center rounded-xl data-[state="checked"]:bg-gray-100 data-[state="checked"]:border-gray-200 px-5 py-2 w-full text-left border border-transparent text-gray-400 data-[state="checked"]:text-gray-700 outline-none'
              >
                <span className='fade-in'>Short</span>
              </RadioGroup.Item>
              <RadioGroup.Item
                value='medium'
                className='flex justify-center rounded-xl data-[state="checked"]:bg-gray-100 data-[state="checked"]:border-gray-200 px-5 py-2 w-full text-left border border-transparent text-gray-400 data-[state="checked"]:text-gray-700 outline-none'
              >
                <span className='fade-in'>Medium</span>
              </RadioGroup.Item>
              <RadioGroup.Item
                value='long'
                className='flex justify-center rounded-xl data-[state="checked"]:bg-gray-100 data-[state="checked"]:border-gray-200 px-5 py-2 w-full text-left border border-transparent text-gray-400 data-[state="checked"]:text-gray-700 outline-none'
              >
                <span className='fade-in'>Long</span>
              </RadioGroup.Item>
            </RadioGroup.Root>
          </div>
          <div className='relative w-full'>
            <button
              onClick={handleSubmit}
              className='w-full rounded-2xl bg-gray-800 border-gray-600 border py-4 text-gray-50'
            >
              <span className='fade-in'>Generate</span>
            </button>
            <div className='w-full absolute z-50 top-0 -translate-y-[calc(100%_+_12px)]  sm:left-0 right-0'>
              <Turnstile
                siteKey={siteKey}
                onSuccess={(token) => handleSuccess(token)}
                onError={(error) => console.log(error)}
                options={{
                  size: 'flexible',
                  theme: 'light',
                  feedbackEnabled: false,
                  execution: 'execute',
                }}
                ref={turnstileRef}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
