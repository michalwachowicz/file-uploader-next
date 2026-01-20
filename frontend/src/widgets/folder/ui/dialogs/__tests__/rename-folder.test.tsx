import React, { useRef } from "react";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { RenameFolderDialog } from "@/widgets/folder/ui/dialogs/rename-folder";
import { renameFolder } from "@/features/folder/api";
import { DialogRef } from "@/shared/ui/dialog";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/folder/api", () => ({
  renameFolder: vi.fn(),
}));

vi.mock("@/shared/assets/icons", () => ({
  CloseIcon: ({ className }: { className?: string }) => (
    <svg data-testid='close-icon' className={className} />
  ),
}));

describe("RenameFolderDialog", () => {
  const mockRefresh = vi.fn();
  const mockRenameFolder = vi.mocked(renameFolder);

  const createTestComponent = (currentFolderId?: string) => {
    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return (
        <RenameFolderDialog ref={dialogRef} currentFolderId={currentFolderId} />
      );
    };
    return TestComponent;
  };

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
    render(<RenameFolderDialog currentFolderId='folder-1' />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Rename Folder")).not.toBeInTheDocument();
  });

  it("renders dialog when opened via ref", () => {
    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Rename Folder")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter new folder name"),
    ).toBeInTheDocument();
    expect(screen.getByText("New Folder Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    const renameButton = screen.getByRole("button", { name: "Rename" });
    expect(renameButton).toBeInTheDocument();
    expect(renameButton).toBeDisabled();
  });

  it("disables Rename button and shows validation error when input is empty", async () => {
    const user = userEvent.setup();
    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.type(input, "Test");
    await user.clear(input);
    await user.tab();

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).toBeDisabled();
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("disables Rename button and shows validation error when input contains only whitespace", async () => {
    const user = userEvent.setup();
    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.type(input, "   ");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).toBeDisabled();
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("enables Rename button when input is valid", async () => {
    const user = userEvent.setup();
    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Renamed Folder");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });
  });

  it("renames folder with valid name", async () => {
    const user = userEvent.setup();
    mockRenameFolder.mockResolvedValue({
      id: "folder-1",
      name: "Renamed Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Renamed Folder");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(mockRenameFolder).toHaveBeenCalledWith("folder-1", {
        name: "Renamed Folder",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("does not rename folder when currentFolderId is undefined", async () => {
    const user = userEvent.setup();
    const TestComponent = createTestComponent();
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Renamed Folder");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(mockRenameFolder).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("shows loading state while renaming folder", async () => {
    const user = userEvent.setup();
    const mockFolder = {
      id: "folder-1",
      name: "Renamed Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let resolveRenameFolder: (value: typeof mockFolder) => void;
    mockRenameFolder.mockImplementation(
      () =>
        new Promise<typeof mockFolder>((resolve) => {
          resolveRenameFolder = resolve;
        }),
    );

    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Renamed Folder");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Renaming..." }),
      ).toBeDisabled();
    });

    resolveRenameFolder!(mockFolder);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error message when folder rename fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "A folder with this name already exists";
    mockRenameFolder.mockRejectedValue(new Error(errorMessage));

    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Existing Folder");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("shows error message when trying to rename to the same name", async () => {
    const user = userEvent.setup();
    const errorMessage = "The new name must be different from the current name";
    mockRenameFolder.mockRejectedValue(new Error(errorMessage));

    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Same Name");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("shows default error message when rename fails with unknown error", async () => {
    const user = userEvent.setup();
    mockRenameFolder.mockRejectedValue({});

    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "New Name");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to rename folder")).toBeInTheDocument();
    });
  });

  it("closes dialog after successful folder rename", async () => {
    const user = userEvent.setup();
    mockRenameFolder.mockResolvedValue({
      id: "folder-1",
      name: "Renamed Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Renamed Folder");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes dialog when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockRenameFolder).not.toHaveBeenCalled();
  });

  it("resets form when dialog is closed", async () => {
    const user = userEvent.setup();

    const TestComponent = createTestComponent("folder-1");
    const { rerender } = render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.type(input, "Test Folder");

    expect(input).toHaveValue("Test Folder");

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    const TestComponent2 = createTestComponent("folder-1");
    rerender(<TestComponent2 />);

    await waitFor(() => {
      const newInput = screen.getByPlaceholderText("Enter new folder name");
      expect(newInput).toHaveValue("");
    });
  });

  it("filters invalid filesystem characters from folder name", async () => {
    const user = userEvent.setup();
    mockRenameFolder.mockResolvedValue({
      id: "folder-1",
      name: "ValidName",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "Valid<>:Name");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(mockRenameFolder).toHaveBeenCalled();
      const callArgs = mockRenameFolder.mock.calls[0][1];
      expect(callArgs.name).toBe("ValidName");
    });
  });

  it("shows validation error for folder name with only invalid characters", async () => {
    const user = userEvent.setup();
    const TestComponent = createTestComponent("folder-1");
    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "<>:");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).toBeDisabled();
    });
  });

  it("clears error message when dialog is closed", async () => {
    const user = userEvent.setup();
    const errorMessage = "Rename failed";
    mockRenameFolder.mockRejectedValue(new Error(errorMessage));

    const TestComponent = createTestComponent("folder-1");
    const { rerender } = render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter new folder name");
    await user.clear(input);
    await user.type(input, "New Name");

    await waitFor(() => {
      const renameButton = screen.getByRole("button", { name: "Rename" });
      expect(renameButton).not.toBeDisabled();
    });

    const renameButton = screen.getByRole("button", { name: "Rename" });
    await user.click(renameButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    const TestComponent2 = createTestComponent("folder-1");
    rerender(<TestComponent2 />);

    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });
});
