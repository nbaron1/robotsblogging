import * as RadioGroup from '@radix-ui/react-radio-group';
import { useState, type HTMLAttributes } from 'react';

export function Form() {
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [topic, setTopic] = useState('');
  const [slug, setSlug] = useState('');

  const handleChangeLengthValue = (value: string) => {
    if (value !== 'short' && value !== 'medium' && value !== 'long') return;

    setLength(value);
  };

  const handleSubmit: HTMLAttributes<HTMLFormElement>['onSubmit'] = async (
    event
  ) => {
    try {
      event.preventDefault();

      const slugWithSlash = `/${slug}`;

      const response = await fetch('/api/v1/pages', {
        body: JSON.stringify({ slug: slugWithSlash, topic, length }),
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create page');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to create page');
      }

      window.location = data.data.url;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      method='POST'
      onSubmit={handleSubmit}
      className='w-full max-w-[500px] mx-auto'
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between'>
            <label htmlFor='topic' className='text-gray-700'>
              Topic
            </label>
            <button className='text-left font-light text-gray-700'>
              Suggest a topic idea
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
        <button
          type='submit'
          className='rounded-2xl bg-gray-800 border-gray-600 border py-4 text-gray-50'
        >
          <span className='fade-in'>Generate</span>
        </button>
      </div>
    </form>
  );
}
