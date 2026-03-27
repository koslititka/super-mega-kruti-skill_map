import { useState, useCallback } from 'react';
import { Input } from '@/shared/ui';
import { debounce } from '@/shared/lib';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  const debouncedChange = useCallback(
    debounce((val: string) => onChange(val), 400),
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    debouncedChange(e.target.value);
  };

  return (
    <Input
      placeholder="Поиск по названию..."
      value={localValue}
      onChange={handleChange}
    />
  );
};
