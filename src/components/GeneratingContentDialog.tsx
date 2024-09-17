import * as Dialog from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import './generate-page-dialog.css';

gsap.registerPlugin(TextPlugin);

function LoadingIcon() {
  return (
    <svg
      width='36'
      height='37'
      viewBox='0 0 36 37'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='animate-spin'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M18.4167 0C19.3371 0 20.0833 0.746192 20.0833 1.66667V5.83333C20.0833 6.75381 19.3371 7.5 18.4167 7.5C17.4962 7.5 16.75 6.75381 16.75 5.83333V1.66667C16.75 0.746192 17.4962 0 18.4167 0ZM5.78595 5.41929C6.43683 4.76841 7.4921 4.76841 8.14298 5.41929L11.6785 8.95482C12.3294 9.60569 12.3294 10.661 11.6785 11.3118C11.0276 11.9627 9.97236 11.9627 9.32149 11.3118L5.78595 7.77631C5.13508 7.12544 5.13508 6.07016 5.78595 5.41929ZM30.7022 5.76447C31.3531 6.41534 31.3531 7.47061 30.7022 8.12149L28.3452 10.4785C27.6943 11.1294 26.639 11.1294 25.9882 10.4785C25.3373 9.82764 25.3373 8.77236 25.9882 8.12149L28.3452 5.76447C28.9961 5.11359 30.0513 5.11359 30.7022 5.76447ZM0.5 17.9167C0.5 16.9962 1.24619 16.25 2.16667 16.25H8C8.92047 16.25 9.66667 16.9962 9.66667 17.9167C9.66667 18.8371 8.92047 19.5833 8 19.5833H2.16667C1.24619 19.5833 0.5 18.8371 0.5 17.9167ZM29.6667 17.9167C29.6667 16.9962 30.4129 16.25 31.3333 16.25H33.8333C34.7538 16.25 35.5 16.9962 35.5 17.9167C35.5 18.8371 34.7538 19.5833 33.8333 19.5833H31.3333C30.4129 19.5833 29.6667 18.8371 29.6667 17.9167ZM12.5118 23.8215C13.1627 24.4724 13.1627 25.5276 12.5118 26.1785L7.7978 30.8926C7.14692 31.5434 6.09165 31.5434 5.44078 30.8926C4.7899 30.2417 4.7899 29.1864 5.44078 28.5355L10.1548 23.8215C10.8057 23.1706 11.861 23.1706 12.5118 23.8215ZM26.8215 26.3215C27.4724 25.6706 28.5276 25.6706 29.1785 26.3215L30.357 27.5C31.0079 28.1509 31.0079 29.2061 30.357 29.857C29.7061 30.5079 28.6509 30.5079 28 29.857L26.8215 28.6785C26.1706 28.0276 26.1706 26.9724 26.8215 26.3215ZM18.4167 26.25C19.3371 26.25 20.0833 26.9962 20.0833 27.9167V34.5833C20.0833 35.5038 19.3371 36.25 18.4167 36.25C17.4962 36.25 16.75 35.5038 16.75 34.5833V27.9167C16.75 26.9962 17.4962 26.25 18.4167 26.25Z'
        fill='#44403C'
      />
    </svg>
  );
}

function CloseIcon() {
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
        d='M4.41009 4.41205C4.73553 4.08661 5.26317 4.08661 5.5886 4.41205L9.99935 8.82279L14.4101 4.41205C14.7355 4.08661 15.2632 4.08661 15.5886 4.41205C15.914 4.73748 15.914 5.26512 15.5886 5.59056L11.1779 10.0013L15.5886 14.412C15.914 14.7375 15.914 15.2651 15.5886 15.5906C15.2632 15.916 14.7355 15.916 14.4101 15.5906L9.99935 11.1798L5.5886 15.5906C5.26317 15.916 4.73553 15.916 4.41009 15.5906C4.08466 15.2651 4.08466 14.7375 4.41009 14.412L8.82084 10.0013L4.41009 5.59056C4.08466 5.26512 4.08466 4.73748 4.41009 4.41205Z'
        fill='#78716C'
      />
    </svg>
  );
}

export function GeneratingContentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: Dialog.DialogProps['onOpenChange'];
}) {
  const textRef = useRef<HTMLParagraphElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='z-20 fixed top-0 left-0 right-0 bottom-0 bg-black opacity-20' />
        <Dialog.Content className='outline-0 justify-between gap-6 sm:w-[375px] sm:-translate-x-1/2 sm:left-1/2 sm:right-auto items-center fade-in-dialog z-30 flex flex-col bg-gray-50 fixed top-1/2 left-5 right-5 -translate-y-1/2 border border-gray-300 shadow-sm rounded-3xl px-6 py-12'>
          <div className='fixed top-5 left-5'>
            <CloseIcon />
          </div>
          <div className='flex items-center flex-col gap-2'>
            <LoadingIcon />
          </div>
          <div className='flex flex-col items-center gap-2'>
            <Dialog.Title className='font-title text-center text-2xl'>
              Generating blog post
            </Dialog.Title>
            <Dialog.Description
              ref={textRef}
              className='text-lg h-8 text-gray-800 text-center font-light'
            >
              {/* TODO: Replace text */}
              Making the perfect post...
            </Dialog.Description>
          </div>
          <p className='text-gray-800 text-center font-light text-sm'>
            Creating a post typically takes ~30 seconds
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
