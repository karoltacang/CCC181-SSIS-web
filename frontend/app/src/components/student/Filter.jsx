import { useState, useEffect, useRef } from 'react';
import '../Components.css';

const MultiSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="form-group" ref={containerRef}>
      <label>{label}</label>
      <div className="multi-select-container">
        <div className={`multi-select-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <span className="selected-text">
            {value.length === 0 
              ? `All ${label}s` 
              : value.length <= 4
                ? value.join(', ') 
                : `${value.length} selected`}
          </span>
          <span className="arrow">▼</span>
        </div>
        {isOpen && (
          <div className="multi-select-dropdown">
            {options.map((option) => (
              <div 
                key={option} 
                className="multi-select-option" 
                onClick={() => toggleOption(option)}
              >
                <input 
                  type="checkbox" 
                  checked={value.includes(option)} 
                  readOnly 
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterStudentModal = ({ isOpen, onClose, onApply, programs, currentFilters }) => {
  const [filters, setFilters] = useState({
    program: [],
    year: [],
    gender: []
  });

  useEffect(() => {
    if (isOpen) {
      const ensureArray = (val) => {
        if (Array.isArray(val)) return val;
        if (val) return [val];
        return [];
      };

      setFilters({
        program: ensureArray(currentFilters.program),
        year: ensureArray(currentFilters.year),
        gender: ensureArray(currentFilters.gender)
      });
    }
  }, [isOpen, currentFilters]);

  const handleFilterChange = (key, newValue) => {
    setFilters(prev => ({ ...prev, [key]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters = { program: [], year: [], gender: [] };
    setFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', overflow: 'visible' }}>
        <div className="header">
          <h2>Filter Students</h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>
        <div className="add-body">
          <form onSubmit={handleSubmit}>
            <MultiSelect 
              label="Program" 
              options={['None', ...programs]} 
              value={filters.program} 
              onChange={(val) => handleFilterChange('program', val)} 
            />
            <MultiSelect 
              label="Year Level" 
              options={['1', '2', '3', '4']} 
              value={filters.year} 
              onChange={(val) => handleFilterChange('year', val)} 
            />
            <MultiSelect 
              label="Gender" 
              options={['Male', 'Female', 'Other']} 
              value={filters.gender} 
              onChange={(val) => handleFilterChange('gender', val)} 
            />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset Filters</button>
              <button type="submit" className="btn btn-primary">Apply</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FilterStudentModal;
