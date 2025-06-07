import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

const languages = [
  { 
    value: 'uk', 
    label: '🇺🇦 Українська', 
    searchTerms: ['ukrainian', 'україна', 'українська', 'ukr', 'ua']
  },
  { 
    value: 'en', 
    label: '🇬🇧 English', 
    searchTerms: ['english', 'англійська', 'england', 'eng', 'gb']
  },
  { 
    value: 'it', 
    label: '🇮🇹 Italiano', 
    searchTerms: ['italian', 'italiano', 'італійська', 'italy', 'italia', 'ita']
  },
  { 
    value: 'de', 
    label: '🇩🇪 Deutsch', 
    searchTerms: ['german', 'deutsch', 'німецька', 'germany', 'deutschland', 'deu', 'ger']
  }
];

const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: '38px',
    background: 'transparent',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#6366F1'
    }
  }),
  option: (base, state) => ({
    ...base,
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: state.isSelected ? '#6366F1' : state.isFocused ? '#EEF2FF' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:active': {
      backgroundColor: '#6366F1'
    }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }),
  singleValue: (base) => ({
    ...base,
    color: '#374151'
  }),
  input: (base) => ({
    ...base,
    color: '#374151'
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9CA3AF'
  })
};

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (selectedOption) => {
    i18n.changeLanguage(selectedOption.value);
  };

  const currentLanguage = languages.find(lang => lang.value === i18n.language) || languages[0];

  const filterLanguages = (inputValue) => {
    return languages.filter(lang => 
      lang.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      lang.searchTerms.some(term => term.toLowerCase().includes(inputValue.toLowerCase()))
    );
  };

  const loadOptions = (inputValue, callback) => {
    callback(filterLanguages(inputValue));
  };

  return (
    <Select
      value={currentLanguage}
      onChange={handleLanguageChange}
      options={languages}
      styles={customStyles}
      isSearchable={true}
      className="w-48"
      placeholder={t('common.selectLanguage')}
      noOptionsMessage={() => t('common.noLanguagesFound')}
      filterOption={(option, input) => {
        if (!input) return true;
        return option.data.searchTerms.some(term => 
          term.toLowerCase().includes(input.toLowerCase())
        ) || option.label.toLowerCase().includes(input.toLowerCase());
      }}
    />
  );
};

export default LanguageSelector; 