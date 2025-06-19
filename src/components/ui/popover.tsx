import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  open,
  onOpenChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onOpenChange]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onClick={() => {
          setIsOpen(!isOpen);
          onOpenChange?.(!isOpen);
        }}
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={popoverRef}
          className={cn(
            'absolute z-50 mt-2 bg-white rounded-md shadow-lg',
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}; 