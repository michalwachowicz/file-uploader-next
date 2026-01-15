import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { SidebarToggler } from "@/widgets/sidebar/ui/sidebar-toggler";

vi.mock("@/widgets/sidebar/assets/icons", () => ({
  MenuIcon: ({ className }: { className?: string }) => (
    <svg data-testid='menu-icon' className={className} />
  ),
}));

describe("SidebarToggler", () => {
  it("renders button with menu icon", () => {
    const mockSetIsOpen = vi.fn();
    render(<SidebarToggler isOpen={false} setIsOpen={mockSetIsOpen} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });

  it("calls setIsOpen with opposite value when clicked", async () => {
    const user = userEvent.setup();
    const mockSetIsOpen = vi.fn();

    const { rerender } = render(
      <SidebarToggler isOpen={false} setIsOpen={mockSetIsOpen} />
    );
    await user.click(screen.getByRole("button"));

    expect(mockSetIsOpen).toHaveBeenCalledWith(true);

    rerender(<SidebarToggler isOpen={true} setIsOpen={mockSetIsOpen} />);
    await user.click(screen.getByRole("button"));

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it("has aria attributes set correctly when sidebar is closed", () => {
    const mockSetIsOpen = vi.fn();
    render(
      <SidebarToggler
        isOpen={false}
        setIsOpen={mockSetIsOpen}
        ariaControls='sidebar-navigation'
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-controls", "sidebar-navigation");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-label", "Open sidebar");
  });

  it("has aria attributes set correctly when sidebar is open", () => {
    const mockSetIsOpen = vi.fn();
    render(
      <SidebarToggler
        isOpen={true}
        setIsOpen={mockSetIsOpen}
        ariaControls='sidebar-navigation'
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-controls", "sidebar-navigation");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-label", "Close sidebar");
  });

  it("does not have aria-controls when ariaControls prop is not provided", () => {
    const mockSetIsOpen = vi.fn();
    render(<SidebarToggler isOpen={false} setIsOpen={mockSetIsOpen} />);

    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("aria-controls");
  });
});
