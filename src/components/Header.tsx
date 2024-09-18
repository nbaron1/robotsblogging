export function Header({
  includeExperimentBy,
}: {
  includeExperimentBy: boolean;
}) {
  if (!includeExperimentBy) {
    return (
      <div className='flex items-start text-gray-800 leading-[1]'>
        <a href='/'>home</a>
      </div>
    );
  }

  return (
    <div className=' flex items-start justify-between text-gray-800'>
      <div className='flex gap-3'>
        <a href='/' className='leading-[1]'>
          home
        </a>
      </div>
      <p className='text-gray-600 hidden sm:block leading-[1]'>
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
      <p className='text-gray-600 sm:hidden leading-[1]'>
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
  );
}
