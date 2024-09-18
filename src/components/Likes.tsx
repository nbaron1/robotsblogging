import { useCallback, useEffect, useState } from 'react';
import './likes.css';
function Heart() {
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
        d='M8.99466 2.78915C7.23973 1.25548 4.64439 0.941638 2.62891 2.66371C0.448817 4.52642 0.13207 7.66353 1.85603 9.88192C2.51043 10.724 3.78767 11.9891 5.01513 13.1476C6.25696 14.3198 7.49593 15.4274 8.10692 15.9685L8.11855 15.9788C8.176 16.0297 8.24752 16.0931 8.31608 16.1447C8.39816 16.2066 8.51599 16.2833 8.67334 16.3302C8.88252 16.3927 9.10738 16.3927 9.31656 16.3302C9.47391 16.2833 9.59174 16.2066 9.67382 16.1447C9.74239 16.0931 9.81391 16.0297 9.87135 15.9788L9.88298 15.9685C10.494 15.4274 11.7329 14.3198 12.9748 13.1476C14.2022 11.9891 15.4795 10.724 16.1339 9.88192C17.8512 7.67205 17.5834 4.51075 15.3532 2.65713C13.3153 0.963309 10.7476 1.2549 8.99466 2.78915ZM8.42501 4.34078C7.14621 2.84575 5.1135 2.51378 3.60331 3.80412C2.02582 5.15196 1.81356 7.38275 3.04044 8.96149C3.61276 9.69795 4.8051 10.8868 6.04474 12.0568C7.20203 13.1492 8.35964 14.1873 8.99495 14.7512C9.63026 14.1873 10.7879 13.1492 11.9452 12.0568C13.1848 10.8868 14.3771 9.69795 14.9495 8.96149C16.183 7.37422 15.9864 5.13386 14.3944 3.8107C12.8442 2.52225 10.838 2.85236 9.56489 4.34078C9.4224 4.50736 9.21416 4.60327 8.99495 4.60327C8.77574 4.60327 8.5675 4.50736 8.42501 4.34078Z'
        fill='#78716C'
      />
    </svg>
  );
}

function LikedHeart() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='liked-heart-animation'
    >
      <path
        d='M8.99466 2.78915C7.23973 1.25548 4.64439 0.941637 2.62891 2.66371C0.448818 4.52642 0.132071 7.66353 1.85603 9.88192C2.51043 10.724 3.78767 11.9891 5.01513 13.1476C6.25696 14.3198 7.49593 15.4274 8.10692 15.9685L8.11855 15.9788C8.176 16.0297 8.24752 16.0931 8.31608 16.1447C8.39816 16.2066 8.51599 16.2833 8.67334 16.3302C8.88252 16.3927 9.10738 16.3927 9.31656 16.3302C9.47391 16.2833 9.59174 16.2066 9.67382 16.1447C9.74239 16.0931 9.81391 16.0297 9.87135 15.9788L9.88298 15.9685C10.494 15.4274 11.7329 14.3198 12.9748 13.1476C14.2022 11.9891 15.4795 10.724 16.1339 9.88192C17.8512 7.67205 17.5834 4.51075 15.3532 2.65713C13.3153 0.963308 10.7476 1.2549 8.99466 2.78915ZM8.42501 4.34078C7.14621 2.84575 5.1135 2.51378 3.60331 3.80412C2.02582 5.15196 1.81356 7.38275 3.04044 8.96149C3.61276 9.69795 4.8051 10.8868 6.04474 12.0568C7.20203 13.1492 8.35964 14.1873 8.99495 14.7512C9.63026 14.1873 10.7879 13.1492 11.9452 12.0568C13.1848 10.8868 14.3771 9.69795 14.9495 8.96149C16.183 7.37422 15.9864 5.13386 14.3944 3.8107C12.8442 2.52225 10.838 2.85236 9.56489 4.34078C9.4224 4.50736 9.21416 4.60327 8.99495 4.60327C8.77574 4.60327 8.5675 4.50736 8.42501 4.34078Z'
        fill='#f87171'
      />
    </svg>
  );
}

type LikesResponse =
  | {
      data: {
        id: number;
        liked: boolean;
        likes: number;
      };
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export function Likes({ id }: { id: string }) {
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [likes, setLikes] = useState<number | null>(null);

  const getLikes = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/likes?id=${id}`);

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const json = (await response.json()) as LikesResponse;

      if (!json.success) {
        throw new Error('Something went wrong');
      }

      return json;
    } catch {
      const oneSecond = new Promise((resolve) => setTimeout(resolve, 1000));

      await oneSecond;

      return getLikes();
    }
  }, []);

  const updateLiked = async (liked: boolean) => {
    try {
      const response = await fetch(`/api/v1/likes`, {
        method: 'POST',
        body: JSON.stringify({ id, liked }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const json = (await response.json()) as LikesResponse;

      if (!json.success) {
        throw new Error('Something went wrong');
      }

      return json;
    } catch {
      const oneSecond = new Promise((resolve) => setTimeout(resolve, 1000));

      await oneSecond;

      return updateLiked(liked);
    }
  };

  useEffect(() => {
    getLikes().then((result) => {
      setLikes(result.data.likes);
      setIsLiked(result.data.liked);
    });
  }, []);

  const handleClick = () => {
    updateLiked(!isLiked).then((data) => {
      setLikes(data.data.likes);
      setIsLiked(data.data.liked);
    });
  };

  if (typeof likes !== 'number' || typeof isLiked !== 'boolean') return null;

  const formattedLikes = likes.toLocaleString();

  return (
    <button
      onClick={handleClick}
      className='fade-in-animation top-6 fixed sm:top-auto sm:bottom-4 right-6 bg-gray-50 border border-solid w-fit px-5 min-w-24 gap-4 py-2 border-gray-200 rounded-full flex items-center'
    >
      {isLiked ? <LikedHeart /> : <Heart />}
      <span
        className='text-lg text-light text-gray-900'
        style={{ margin: 0, padding: 0 }}
      >
        {formattedLikes}
      </span>
    </button>
  );
}
