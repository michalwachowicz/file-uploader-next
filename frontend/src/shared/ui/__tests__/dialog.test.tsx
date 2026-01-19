import React, { useRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogActions, DialogRef } from "@/shared/ui/dialog";

vi.mock("@/shared/assets/icons", () => ({
  CloseIcon: ({ className }: { className?: string }) => (
    <svg data-testid='close-icon' className={className} />
  ),
}));

describe("Dialog", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("does not render when open is false", () => {
    render(
      <Dialog title='Test Dialog' open={false} onOpenChange={mockOnOpenChange}>
        <div>Dialog Content</div>
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Dialog")).not.toBeInTheDocument();
  });

  it("renders correctly when open is true", () => {
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Dialog Content</div>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog Content")).toBeInTheDocument();

    const title = screen.getByText("Test Dialog");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H2");

    expect(
      screen.getByRole("button", { name: "Close dialog" }),
    ).toBeInTheDocument();
  });

  it("closes dialog when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog when Escape key is pressed", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    await user.keyboard("{Escape}");

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog when backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");
    await user.click(dialog);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close dialog when content is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    const content = screen.getByText("Content");
    await user.click(content);

    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it("sets body overflow to hidden when open", () => {
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow when closed", () => {
    const { rerender } = render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Dialog title='Test Dialog' open={false} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    expect(document.body.style.overflow).toBe("");
  });

  it("has correct ARIA attributes", () => {
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  it("associates title with dialog via aria-labelledby", () => {
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>Content</div>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog");
    const title = screen.getByText("Test Dialog");
    const titleId = title.getAttribute("id");
    const labelledBy = dialog.getAttribute("aria-labelledby");

    expect(labelledBy).toBe(titleId);
  });

  it("focuses first focusable element when opened", async () => {
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>
          <button>First Button</button>
          <button>Second Button</button>
        </div>
      </Dialog>,
    );

    await waitFor(() => {
      const closeButton = screen.getByRole("button", { name: "Close dialog" });
      expect(closeButton).toHaveFocus();
    });
  });

  it("handles tab trapping when tabbing from last element", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>
          <button>First Button</button>
          <button>Second Button</button>
        </div>
      </Dialog>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Close dialog" }),
      ).toHaveFocus();
    });

    await user.tab();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "First Button" }),
      ).toHaveFocus();
    });

    await user.tab();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Second Button" }),
      ).toHaveFocus();
    });

    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Close dialog" }),
      ).toHaveFocus();
    });
  });

  it("handles shift+tab trapping from first element", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title='Test Dialog' open={true} onOpenChange={mockOnOpenChange}>
        <div>
          <button>First Button</button>
          <button>Second Button</button>
        </div>
      </Dialog>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Close dialog" }),
      ).toHaveFocus();
    });

    await user.tab({ shift: true });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Second Button" }),
      ).toHaveFocus();
    });
  });

  it("exposes open method via ref", () => {
    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      return (
        <>
          <button onClick={() => dialogRef.current?.open()}>Open Dialog</button>
          <Dialog
            ref={dialogRef}
            title='Test Dialog'
            open={false}
            onOpenChange={mockOnOpenChange}
          >
            <div>Content</div>
          </Dialog>
        </>
      );
    };

    render(<TestComponent />);

    const openButton = screen.getByRole("button", { name: "Open Dialog" });
    openButton.click();

    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("DialogActions", () => {
  it("renders children", () => {
    render(
      <DialogActions>
        <button>Action 1</button>
        <button>Action 2</button>
      </DialogActions>,
    );

    expect(
      screen.getByRole("button", { name: "Action 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Action 2" }),
    ).toBeInTheDocument();
  });

  it("passes through additional HTML attributes", () => {
    const { container } = render(
      <DialogActions data-testid='actions' aria-label='Dialog actions'>
        <button>Action</button>
      </DialogActions>,
    );

    const actions = container.firstChild;
    expect(actions).toHaveAttribute("data-testid", "actions");
    expect(actions).toHaveAttribute("aria-label", "Dialog actions");
  });
});
