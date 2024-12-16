import React, { useState } from 'react';
import { Autocomplete, TextField, createFilterOptions } from '@mui/material';

// Define interfaces for component props and options
interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  label: string;
  placeholder?: string;
  onChange: (value: string | null) => void;
  initialValue?: Option | null;
}

// Create filter options for autocomplete
const filter = createFilterOptions<Option>();

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  label,
  placeholder = 'Select an option',
  onChange,
  initialValue = null,
}) => {
  const [value, setValue] = useState<Option | null>(initialValue);

  // Handle change events from the Autocomplete component
  const handleChange = (
    event: React.SyntheticEvent, 
    newValue: string | Option | null
  ) => {
    // Handle different types of values
    if (typeof newValue === 'string') {
      // Handle string input
      if (newValue.trim() === '') {
        setValue(null);
        onChange(null);
      } else {
        const matchingOption = options.find(option => option.label === newValue);
        setValue(matchingOption || null);
        onChange(matchingOption?.value || null);
      }
    } else {
      // Handle Option object or null
      setValue(newValue);
      onChange(newValue?.value || null);
    }
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option?.label ?? '';
      }}
      renderOption={(props, option) => <li {...props}>{option.label}</li>}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
      freeSolo
      fullWidth
    />
  );
};