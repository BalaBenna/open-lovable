import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps {
  icon: LucideIcon;
  size?: number | string;
  className?: string;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 16,
  className,
  onClick,
  ...props
}) => {
  const iconSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <IconComponent
      size={size}
      className={cn('inline-block', className)}
      onClick={onClick}
      style={{ width: iconSize, height: iconSize }}
      {...props}
    />
  );
};

export default Icon;
