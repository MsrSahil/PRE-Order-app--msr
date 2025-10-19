import React from 'react';

const Input = React.forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
});

export default Input;   