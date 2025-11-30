import React from 'react';
import { Loader2 } from 'lucide-react'; // Icon loading
import { cn } from '../../lib/utils'; 

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', isLoading, disabled, ...props }, ref) => {
    
    // 1. Style chung cho tất cả nút
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
    
    // 2. Style riêng từng loại (Dùng màu từ globals.css @theme)
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-gray-200",
      outline: "border border-border bg-background hover:bg-secondary text-foreground",
      ghost: "hover:bg-secondary text-foreground",
      danger: "bg-destructive text-destructive-foreground hover:bg-red-600",
    };

    // 3. Style kích thước
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Nếu đang loading thì hiện icon quay quay */}
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";