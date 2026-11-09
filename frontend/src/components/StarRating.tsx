import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  testId?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
  testId = 'star-rating',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayedRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
      data-testid={testId}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(displayedRating);

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: interactive ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: 1,
              color: isFilled ? '#f59e0b' : '#cbd5e1',
            }}
            data-testid={`${testId}-star-${starValue}`}
            aria-label={`${starValue} star`}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              stroke={isFilled ? '#f59e0b' : '#94a3b8'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
};

