import React from 'react';

const Card = React.forwardRef(({ title, content, footer, ...props }, ref) => {
  return (
    <div className="card" ref={ref} {...props}>
      <div className="card-header">{title}</div>
      <div className="card-body">{content}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
});

export default Card;
