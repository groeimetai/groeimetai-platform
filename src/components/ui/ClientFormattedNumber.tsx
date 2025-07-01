'use client';

import { useState, useEffect } from 'react';

interface ClientFormattedNumberProps {
  value: number;
}

export function ClientFormattedNumber({ value }: ClientFormattedNumberProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <span>
      {isClient ? value.toLocaleString() : value}
    </span>
  );
}
