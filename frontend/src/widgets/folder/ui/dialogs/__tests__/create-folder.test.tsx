import React, { useRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { CreateFolderDialog } from "@/widgets/folder/ui/dialogs/create-folder";
import { createFolder } from "@/features/folder/api";
import { DialogRef } from "@/shared/ui/dialog";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/folder/api", () => ({
  createFolder: vi.fn(),
}));

vi.mock("@/shared/assets/icons", () => ({
  CloseIcon: ({ className }: { className?: string }) => (
    <svg data-testid='close-icon' className={className} />
  ),
}));

describe("CreateFolderDialog", () => {
  const mockRefresh = vi.fn();
  const mockCreateFolder = vi.mocked(createFolder);

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
    render(<CreateFolderDialog currentFolderId='folder-1' />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Create Folder")).not.toBeInTheDocument();
  });

  it("renders dialog when opened via ref", () => {
    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create Folder")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter folder name"),
    ).toBeInTheDocument();
    expect(screen.getByText("Folder Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    const createButton = screen.getByRole("button", { name: "Create" });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });

  it("disables Create button and shows validation error when input contains only whitespace", async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.type(input, "   ");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).toBeDisabled();
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("enables Create button when input is valid", async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "New Folder");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).not.toBeDisabled();
    });
  });

  it("creates folder with valid name and currentFolderId", async () => {
    const user = userEvent.setup();
    mockCreateFolder.mockResolvedValue({
      id: "new-folder-1",
      name: "New Folder",
      ownerId: "user-1",
      parentId: "folder-1",
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "New Folder");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).not.toBeDisabled();
    });

    const createButton = screen.getByRole("button", { name: "Create" });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        name: "New Folder",
        parentId: "folder-1",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("creates folder in root when currentFolderId is undefined", async () => {
    const user = userEvent.setup();
    mockCreateFolder.mockResolvedValue({
      id: "new-folder-1",
      name: "Root Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "Root Folder");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).not.toBeDisabled();
    });

    const createButton = screen.getByRole("button", { name: "Create" });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        name: "Root Folder",
        parentId: undefined,
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows loading state while creating folder", async () => {
    const user = userEvent.setup();
    const mockFolder = {
      id: "new-folder-1",
      name: "New Folder",
      ownerId: "user-1",
      parentId: "folder-1",
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let resolveCreateFolder: (value: typeof mockFolder) => void;
    mockCreateFolder.mockImplementation(
      () =>
        new Promise<typeof mockFolder>((resolve) => {
          resolveCreateFolder = resolve;
        }),
    );

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "New Folder");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).not.toBeDisabled();
    });

    const createButton = screen.getByRole("button", { name: "Create" });
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Creating..." }),
      ).toBeDisabled();
    });

    resolveCreateFolder!(mockFolder);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error message when folder creation fails", async () => {
    const user = userEvent.setup();
    const errorMessage = "Folder name already exists";
    mockCreateFolder.mockRejectedValue(new Error(errorMessage));

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "New Folder");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).not.toBeDisabled();
    });

    const createButton = screen.getByRole("button", { name: "Create" });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("closes dialog after successful folder creation", async () => {
    const user = userEvent.setup();
    mockCreateFolder.mockResolvedValue({
      id: "new-folder-1",
      name: "New Folder",
      ownerId: "user-1",
      parentId: "folder-1",
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "New Folder");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).not.toBeDisabled();
    });

    const createButton = screen.getByRole("button", { name: "Create" });
    await user.click(createButton);

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

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockCreateFolder).not.toHaveBeenCalled();
  });

  it("resets form when dialog is closed", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    const { rerender } = render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.type(input, "Test Folder");

    expect(input).toHaveValue("Test Folder");

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Reopen dialog
    const TestComponent2 = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    rerender(<TestComponent2 />);

    await waitFor(() => {
      const newInput = screen.getByPlaceholderText("Enter folder name");
      expect(newInput).toHaveValue("");
    });
  });

  it("filters invalid filesystem characters from folder name", async () => {
    const user = userEvent.setup();
    mockCreateFolder.mockResolvedValue({
      id: "new-folder-1",
      name: "ValidName",
      ownerId: "user-1",
      parentId: "folder-1",
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "Valid<>:Name");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).not.toBeDisabled();
    });

    const createButton = screen.getByRole("button", { name: "Create" });
    await user.click(createButton);

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalled();
      const callArgs = mockCreateFolder.mock.calls[0][0];
      expect(callArgs.name).toBe("ValidName");
    });
  });

  it("shows validation error for folder name with only invalid characters", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const dialogRef = useRef<DialogRef>(null);

      React.useEffect(() => {
        dialogRef.current?.open();
      }, []);

      return <CreateFolderDialog ref={dialogRef} currentFolderId='folder-1' />;
    };

    render(<TestComponent />);

    const input = screen.getByPlaceholderText("Enter folder name");
    await user.clear(input);
    await user.type(input, "<>:");

    await waitFor(() => {
      const createButton = screen.getByRole("button", { name: "Create" });
      expect(createButton).toBeDisabled();
    });
  });
});
