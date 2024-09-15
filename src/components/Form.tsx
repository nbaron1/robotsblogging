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
      console.log('submitting!');
      event.preventDefault();

      const slugWithSlash = `/${slug}`;

      const response = await fetch('/api/v1/page', {
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
    <form method='POST' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-2'>
          <div className='flex flex-col'>
            <label htmlFor='topic' className='text-gray-50'>
              Topic
            </label>
            <button className='text-left text-gray-400'>
              Suggest a fun topic idea
            </button>
          </div>
          <input
            className='border text-gray-50 px-6 outline-none rounded-2xl h-14 bg-gray-800 border-gray-700'
            type='text'
            name='topic'
            placeholder='Write anything here'
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label htmlFor='slug' className='text-gray-50'>
            URL Slug
          </label>
          <div className='relative'>
            <input
              className='h-14 text-gray-50 outline-none pl-11 pr-6 w-full rounded-2xl border bg-gray-800 border-gray-700'
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
          <p className='text-gray-50'>Length</p>
          <RadioGroup.Root
            value={length}
            onValueChange={handleChangeLengthValue}
            className='flex flex-col bg-gray-800 border border-gray-700 rounded-2xl p-2 items-start'
          >
            <RadioGroup.Item
              value='short'
              className='rounded-xl data-[state="checked"]:bg-gray-700 data-[state="checked"]:border-gray-600 px-5 py-3 w-full text-left text-gray-50 border border-transparent'
            >
              Short
            </RadioGroup.Item>
            <RadioGroup.Item
              value='medium'
              className='rounded-xl data-[state="checked"]:bg-gray-700 data-[state="checked"]:border-gray-600 px-5 py-3 w-full text-left text-gray-50 border border-transparent'
            >
              Medium
            </RadioGroup.Item>
            <RadioGroup.Item
              value='long'
              className='rounded-xl data-[state="checked"]:bg-gray-700 data-[state="checked"]:border-gray-600 px-5 py-3 w-full text-left text-gray-50 border border-transparent'
            >
              Long
            </RadioGroup.Item>
          </RadioGroup.Root>
        </div>
        <button
          type='submit'
          className='rounded-2xl bg-gray-800 border mt-3 border-gray-700 py-4 text-gray-50'
        >
          Submit
        </button>
      </div>
    </form>
  );
}
