import styles from './Score.module.css';

function ChevronUp() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L18.7071 14.2929C19.0976 14.6834 19.0976 15.3166 18.7071 15.7071C18.3166 16.0976 17.6834 16.0976 17.2929 15.7071L12 10.4142L6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289Z'
        fill='#FAFAF9'
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.2929C5.68341 7.90237 6.31658 7.90237 6.7071 8.2929L12 13.5858L17.2929 8.2929C17.6834 7.90237 18.3166 7.90237 18.7071 8.2929C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071Z'
        fill='#FAFAF9'
      />
    </svg>
  );
}

export function Score() {
  return (
    <div className={styles.wrapper}>
      <ChevronUp />
      <h4>0</h4>
      <ChevronDown />
    </div>
  );
}
