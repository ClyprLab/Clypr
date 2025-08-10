import React from 'react';

function Text(props: any) {
  const { as, children, variant = 'body', align = 'left', weight, color, className } = props;

  const Comp: any = as || (variant === 'h1' ? 'h1' : variant === 'h2' ? 'h2' : variant === 'h3' ? 'h3' : variant === 'h4' ? 'h4' : variant === 'h5' ? 'h5' : variant === 'h6' ? 'h6' : variant === 'caption' ? 'span' : 'p');

  const size = variant === 'h1' ? 'text-3xl' :
               variant === 'h2' ? 'text-2xl' :
               variant === 'h3' ? 'text-xl' :
               variant === 'h4' ? 'text-lg' :
               variant === 'h5' ? 'text-sm' :
               variant === 'h6' ? 'text-xs' :
               variant === 'body-sm' ? 'text-sm' :
               variant === 'mono' ? 'text-base' :
               variant === 'mono-sm' ? 'text-sm' :
               'text-base';

  const font = variant === 'mono' || variant === 'mono-sm' ? 'font-mono' : 'font-sans';
  const weightCls = weight === 'bold' ? 'font-bold' : weight === 'semibold' ? 'font-semibold' : weight === 'medium' ? 'font-medium' : 'font-normal';
  const alignCls = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <Comp className={[size, font, weightCls, alignCls, color ? '' : 'text-neutral-100', className || ''].join(' ')} style={color ? { color } : undefined}>
      {children}
    </Comp>
  );
}

export default Text;
