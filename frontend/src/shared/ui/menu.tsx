"use client";

import clsx from "clsx";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useId,
  ReactNode,
  ButtonHTMLAttributes,
  HTMLAttributes,
  useCallback,
} from "react";

/**
 * Menu context to share state between Menu, MenuTrigger, and MenuItem components.
 */
interface MenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  menuId: string;
  triggerId: string;
  position: MenuPosition;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("Menu components must be used within a Menu");
  }
  return context;
}

type MenuPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Menu content (MenuTrigger and MenuList).
   */
  children: ReactNode;
  /**
   * Optional controlled open state.
   */
  open?: boolean;
  /**
   * Optional callback when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional default open state.
   */
  defaultOpen?: boolean;
  /**
   * Optional position of the menu list relative to the trigger.
   * @default "bottom-right"
   */
  position?: MenuPosition;
  /**
   * Optional additional CSS classes for the menu container.
   */
  className?: string;
}

/**
 * Menu container component that manages state and positioning.
 * Must contain MenuTrigger and MenuList components.
 */
export function Menu({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  position = "bottom-right",
  className,
  ...props
}: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const menuRef = useRef<HTMLDivElement>(null);

  const baseId = useId();
  const menuId = `menu-${baseId}`;
  const triggerId = `menu-trigger-${baseId}`;

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen]);

  return (
    <MenuContext.Provider
      value={{ isOpen, setIsOpen, menuId, triggerId, position }}
    >
      <div ref={menuRef} className={clsx("relative", className)} {...props}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

/**
 * MenuTrigger component props.
 */
export interface MenuTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Trigger button content.
   */
  children: ReactNode;
  /**
   * Optional additional CSS classes.
   */
  className?: string;
  /**
   * Optional custom trigger element (overrides default button).
   */
  asChild?: boolean;
}

/**
 * MenuTrigger component - customizable button that opens/closes the menu.
 */
export function MenuTrigger({
  children,
  className,
  asChild,
  onClick,
  ...props
}: MenuTriggerProps) {
  const { isOpen, setIsOpen, triggerId, menuId } = useMenuContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setTimeout(() => {
        const firstItem = document.querySelector(
          `[data-menu-item="${menuId}"]:first-of-type`
        ) as HTMLElement;
        firstItem?.focus();
      }, 0);
    }
  };

  if (
    asChild &&
    typeof children === "object" &&
    children !== null &&
    "props" in children
  ) {
    return (
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setIsOpen(true);
            setTimeout(() => {
              const firstItem = document.querySelector(
                `[data-menu-item="${menuId}"]:first-of-type`
              ) as HTMLElement;
              firstItem?.focus();
            }, 0);
          }
        }}
        role='button'
        tabIndex={0}
        aria-haspopup='true'
        aria-expanded={isOpen}
        aria-controls={menuId}
        id={triggerId}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      {...props}
      id={triggerId}
      type='button'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-haspopup='true'
      aria-expanded={isOpen}
      aria-controls={menuId}
      className={clsx(className)}
    >
      {children}
    </button>
  );
}

/**
 * MenuList component props.
 */
export interface MenuListProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * Menu items (MenuItem components).
   */
  children: ReactNode;
  /**
   * Optional additional CSS classes.
   */
  className?: string;
}

/**
 * MenuList component - container for menu items.
 */
export function MenuList({ children, className, ...props }: MenuListProps) {
  const { isOpen, menuId, triggerId, position } = useMenuContext();
  const listRef = useRef<HTMLUListElement>(null);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !listRef.current) return;

    const items = listRef.current.querySelectorAll<HTMLElement>(
      `[data-menu-item="${menuId}"]`
    );
    if (items.length === 0) return;

    let focusedIndex = -1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
        items[focusedIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        items[focusedIndex]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, menuId]);

  if (!isOpen) return null;

  const positionClasses = {
    "bottom-right": "top-full right-0 mt-1",
    "bottom-left": "top-full left-0 mt-1",
    "top-right": "bottom-full right-0 mb-1",
    "top-left": "bottom-full left-0 mb-1",
  };

  return (
    <ul
      ref={listRef}
      id={menuId}
      role='menu'
      aria-labelledby={triggerId}
      className={clsx(
        "absolute z-50 min-w-[220px] bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 focus:outline-none",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </ul>
  );
}

/**
 * MenuItem component props.
 */
export interface MenuItemProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * Menu item content.
   */
  children: ReactNode;
  /**
   * Optional click handler.
   */
  onSelect?: () => void;
  /**
   * Optional additional CSS classes.
   */
  className?: string;
  /**
   * Whether the item is disabled.
   */
  disabled?: boolean;
}

/**
 * MenuItem component - individual menu option.
 */
export function MenuItem({
  children,
  onSelect,
  className,
  disabled,
  onClick,
  ...props
}: MenuItemProps) {
  const { setIsOpen, menuId } = useMenuContext();

  const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
    onSelect?.();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.();
      setIsOpen(false);
    }
  };

  return (
    <li
      {...props}
      role='menuitem'
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-menu-item={menuId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        "px-4 py-2 text-base cursor-pointer focus:outline-none focus:bg-slate-700 font-medium",
        {
          "opacity-50 cursor-not-allowed": disabled,
          "hover:bg-slate-700": !disabled,
        },
        className
      )}
    >
      {children}
    </li>
  );
}
