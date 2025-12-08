import { useEffect, useState } from "react";

export function useDebounce(value: string, delay?: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay || 300);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
