import React, { useRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { DeleteFolderDialog } from "@/widgets/folder/ui/dialogs/delete-folder";
import { deleteFolder } from "@/features/folder/api";
import { DialogRef } from "@/shared/ui/dialog";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/folder/api", () => ({
  deleteFolder: vi.fn(),
}));

vi.mock("@/shared/assets/icons", () => ({
  CloseIcon: ({ className }: { className?: string }) => (
    <svg data-testid='close-icon' className={className} />
  ),
}));

describe("DeleteFolderDialog", () => {
  const mockRefresh = vi.fn();
  const mockDeleteFolder = vi.mocked(deleteFolder);

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";

    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("does not render when dialog is closed", () => {
    render(<DeleteFolderDialog currentFolderId='folder-1' />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete Folder")).not.toBeInTheDocument();
  });

  it("renders dialog when opened via ref", () => {
    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Folder")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to delete this folder and all its contents? This action is irreversible.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("deletes folder when Delete button is clicked", async () => {
    const user = userEvent.setup();
    mockDeleteFolder.mockResolvedValue(undefined);

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteFolder).toHaveBeenCalledWith("folder-1");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("does not delete folder when currentFolderId is undefined", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} />;
    };

    render(<TestComponent />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteFolder).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("shows loading state while deleting folder", async () => {
    const user = userEvent.setup();
    let resolveDeleteFolder: () => void;
    mockDeleteFolder.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDeleteFolder = resolve;
        }),
    );

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Deleting..." }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    resolveDeleteFolder!();

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error message when folder deletion fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "You are not allowed to delete this folder";
    mockDeleteFolder.mockRejectedValue(new Error(errorMessage));

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("shows default error message when deletion fails with unknown error", async () => {
    const user = userEvent.setup();
    mockDeleteFolder.mockRejectedValue({});

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to delete folder")).toBeInTheDocument();
    });
  });

  it("closes dialog after successful folder deletion", async () => {
    const user = userEvent.setup();
    mockDeleteFolder.mockResolvedValue(undefined);

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes dialog when Cancel button is clicked", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockDeleteFolder).not.toHaveBeenCalled();
  });

  it("clears error message when dialog is closed", async () => {
    const user = userEvent.setup();
    const errorMessage = "Deletion failed";
    mockDeleteFolder.mockRejectedValue(new Error(errorMessage));

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <DeleteFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    const { rerender } = render(<TestComponent />);

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });
});
