
// created a button component with customizable props for text, onClick handler, and styles
import React from 'react';

const Button = React.forwardRef(({ text, onClick, style, ...props }, ref) => {
  return (
    <button ref={ref} onClick={onClick} style={style} {...props}>
      {text}
    </button>
  );
});

export default Button;
