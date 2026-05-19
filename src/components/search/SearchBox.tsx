import { useEffect, useRef, useState } from 'react';

interface SearchBoxProps {
  onChange: (query: string) => void;
  debounceMs?: number;
  placeholder?: string;
}

export function SearchBox({ onChange, debounceMs = 200, placeholder = '검색' }: SearchBoxProps) {
  const [raw, setRaw] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setRaw(next);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onChangeRef.current(next);
      timeoutRef.current = null;
    }, debounceMs);
  };

  return (
    <input
      type="search"
      value={raw}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full bg-[#ffffff] text-[#2b3437] placeholder:text-[#586064] rounded-[0.7rem] px-[1.4rem] py-[0.7rem] text-sm outline-none focus:ring-2 focus:ring-[#0053dc]"
    />
  );
}
