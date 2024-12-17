// Import necessary components from Joy UI
import React, { useState } from 'react';
import Autocomplete from '@mui/joy/Autocomplete';
import { createFilterOptions } from '@mui/material';

// Define interface for option structure
interface Option {
  label: string;
  value: string;
}

// Define props interface for the SearchableSelect component
interface SearchableSelectProps {
  options: Option[];
  label: string;
  placeholder?: string;
  onChange: (value: string | null) => void;
  initialValue?: Option | null;
}

// Create filter options for autocomplete functionality
const filter = createFilterOptions<Option>();

/**
 * SearchableSelect Component
 * A searchable dropdown component built with Joy UI's Autocomplete
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  label,
  placeholder = 'Select an option',
  onChange,
  initialValue = null,
}) => {
  // State to manage selected value
  const [value, setValue] = useState<Option | null>(initialValue);

  /**
   * Handle change event when user selects or inputs a value
   * @param event - React synthetic event
   * @param newValue - New selected value (can be string, Option object, or null)
   */
  const handleChange = (
    event: React.SyntheticEvent, 
    newValue: string | Option | null
  ) => {
    if (typeof newValue === 'string') {
      if (newValue.trim() === '') {
        setValue(null);
        onChange(null);
      } else {
        const matchingOption = options.find(option => option.label === newValue);
        setValue(matchingOption || null);
        onChange(matchingOption?.value || null);
      }
    } else {
      setValue(newValue);
      onChange(newValue?.value || null);
    }
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      options={options}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        return filtered;
      }}
      // Configure how options are displayed and handled
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      placeholder={placeholder}
      // Custom option label getter
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option?.label ?? '';
      }}
      // Custom option rendering
      renderOption={(props, option) => (
        <li {...props}  style={{
            padding: '8px 12px',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '';
          }}>{option.label}</li>
      )}
      // Styling customization
      sx={{
        width: '100%',
        // Add any additional custom styles here
        '--Input-focusedHighlight': 'none',
        '--Input-focusedThickness': '0.5px',
      }}
      // Additional Joy UI specific props
      variant="outlined"
      color="neutral"
      size="sm"
    />
  );
};