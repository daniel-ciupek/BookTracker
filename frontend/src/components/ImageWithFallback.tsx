import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback: React.ReactNode;
}

export function ImageWithFallback({ src, fallback, alt, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={() => setError(true)}
      onLoad={(e) => {
        const img = e.currentTarget;
        // Open Library returns a 1x1 transparent pixel for missing covers
        if (img.naturalWidth === 1 && img.naturalHeight === 1) {
          setError(true);
        }
      }}
    />
  );
}
