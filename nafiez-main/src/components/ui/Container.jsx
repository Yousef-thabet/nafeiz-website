export function Container({ children, className = '', as: Tag = 'div', narrow = false }) {
  return (
    <Tag className={`${narrow ? 'container-narrow' : 'container-base'} ${className}`}>
      {children}
    </Tag>
  );
}
