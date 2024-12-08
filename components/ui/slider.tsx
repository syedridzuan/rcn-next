// Example of a simple slider component
import React from 'react';

export const Slider = ({ value, onChange, max, step }) => {
  return (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      max={max}
      step={step}
      className="slider"
    />
  );
};

export default Slider;