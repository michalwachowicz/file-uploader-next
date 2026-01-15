import { MenuIcon } from "@/widgets/sidebar/assets/icons";

/**
 * Props for the SidebarToggler component.
 */
interface SidebarTogglerProps {
  /**
   * Whether the sidebar is open.
   */
  isOpen: boolean;
  /**
   * Function to set the sidebar open state.
   */
  setIsOpen: (isOpen: boolean) => void;
  /**
   * Optional ID of the sidebar element that this button controls.
   * Used for accessibility (aria-controls).
   */
  ariaControls?: string;
}

/**
 * Sidebar toggler component that displays a menu icon when the sidebar is closed and
 * a close icon when the sidebar is open.
 *
 * Features:
 * - Accessible button with proper ARIA attributes
 * - Indicates the sidebar state (open/closed) to screen readers
 * - Links the button to the sidebar it controls via aria-controls
 *
 * @param props - SidebarToggler component props
 * @returns Sidebar toggler component
 */
export function SidebarToggler({
  isOpen,
  setIsOpen,
  ariaControls,
}: SidebarTogglerProps) {
  return (
    <button
      type='button'
      onClick={() => setIsOpen(!isOpen)}
      className='text-slate-400'
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={isOpen}
      aria-controls={ariaControls}
    >
      <MenuIcon className='size-6.5' />
    </button>
  );
}
