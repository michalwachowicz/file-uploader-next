import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { AddButton } from "@/widgets/sidebar/ui/add-button";
import { createFolder } from "@/features/folder/api";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/folder/api", () => ({
  createFolder: vi.fn(),
}));

vi.mock("@/shared/assets/icons", () => ({
  AddIcon: ({ className }: { className?: string }) => (
    <svg data-testid='add-icon' className={className} />
  ),
  FileIcon: ({ className }: { className?: string }) => (
    <svg data-testid='file-icon' className={className} />
  ),
  FolderIcon: ({ className }: { className?: string }) => (
    <svg data-testid='folder-icon' className={className} />
  ),
}));

describe("AddButton", () => {
  const mockRefresh = vi.fn();
  const mockCreateFolder = vi.mocked(createFolder);

  beforeEach(() => {
    vi.clearAllMocks();
    global.prompt = vi.fn();
    global.alert = vi.fn();

    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("renders NEW button with add icon", () => {
    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    expect(button).toBeInTheDocument();
    expect(screen.getByText("NEW")).toBeInTheDocument();
    expect(screen.getByTestId("add-icon")).toBeInTheDocument();
  });

  it("opens menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New Folder")).toBeInTheDocument();
      expect(screen.getByTestId("folder-icon")).toBeInTheDocument();
      expect(screen.getByText("New File")).toBeInTheDocument();
      expect(screen.getByTestId("file-icon")).toBeInTheDocument();
    });
  });

  it("creates folder when New Folder is selected", async () => {
    const user = userEvent.setup();
    vi.mocked(global.prompt).mockReturnValue("Test Folder");
    mockCreateFolder.mockResolvedValue({
      id: "new-folder-1",
      name: "Test Folder",
      ownerId: "user-1",
      parentId: "folder-1",
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New Folder")).toBeInTheDocument();
    });

    const folderMenuItem = screen.getByText("New Folder");
    await user.click(folderMenuItem);

    await waitFor(() => {
      expect(global.prompt).toHaveBeenCalledWith("Enter folder name:");
      expect(mockCreateFolder).toHaveBeenCalledWith({
        name: "Test Folder",
        parentId: "folder-1",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("does not create folder when prompt is cancelled", async () => {
    const user = userEvent.setup();
    vi.mocked(global.prompt).mockReturnValue(null);

    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New Folder")).toBeInTheDocument();
    });

    const folderMenuItem = screen.getByText("New Folder");
    await user.click(folderMenuItem);

    await waitFor(() => {
      expect(global.prompt).toHaveBeenCalled();
      expect(mockCreateFolder).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("does not create folder when prompt returns empty string", async () => {
    const user = userEvent.setup();
    vi.mocked(global.prompt).mockReturnValue("   ");

    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New Folder")).toBeInTheDocument();
    });

    const folderMenuItem = screen.getByText("New Folder");
    await user.click(folderMenuItem);

    await waitFor(() => {
      expect(mockCreateFolder).not.toHaveBeenCalled();
    });
  });

  it("creates folder in root when currentFolderId is undefined", async () => {
    const user = userEvent.setup();
    vi.mocked(global.prompt).mockReturnValue("Root Folder");
    mockCreateFolder.mockResolvedValue({
      id: "new-folder-1",
      name: "Root Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    render(<AddButton />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New Folder")).toBeInTheDocument();
    });

    const folderMenuItem = screen.getByText("New Folder");
    await user.click(folderMenuItem);

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        name: "Root Folder",
        parentId: undefined,
      });
    });
  });

  it("shows error alert when folder creation fails", async () => {
    const user = userEvent.setup();
    vi.mocked(global.prompt).mockReturnValue("Test Folder");
    const errorMessage = "Folder name already exists";
    mockCreateFolder.mockRejectedValue(new Error(errorMessage));

    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New Folder")).toBeInTheDocument();
    });

    const folderMenuItem = screen.getByText("New Folder");
    await user.click(folderMenuItem);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(errorMessage);
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  it("disables button and menu items while creating", async () => {
    const user = userEvent.setup();
    vi.mocked(global.prompt).mockReturnValue("Test Folder");
    const mockFolder = {
      id: "new-folder-1",
      name: "Test Folder",
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
        })
    );

    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New Folder")).toBeInTheDocument();
    });

    const folderMenuItem = screen.getByText("New Folder");
    expect(folderMenuItem).not.toBeDisabled();

    await user.click(folderMenuItem);

    await waitFor(
      () => {
        const buttonAfterClick = screen.getByRole("button", {
          name: "New item",
        });
        expect(buttonAfterClick).toBeDisabled();
      },
      { timeout: 1000 }
    );

    expect(mockCreateFolder).toHaveBeenCalledWith({
      name: "Test Folder",
      parentId: "folder-1",
    });

    resolveCreateFolder!(mockFolder);

    await waitFor(
      () => {
        const buttonAfterResolve = screen.getByRole("button", {
          name: "New item",
        });
        expect(buttonAfterResolve).not.toBeDisabled();
      },
      { timeout: 1000 }
    );
  });

  it("handles New File menu item click", async () => {
    const user = userEvent.setup();
    render(<AddButton currentFolderId='folder-1' />);

    const button = screen.getByRole("button", { name: "New item" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("New File")).toBeInTheDocument();
    });

    const fileMenuItem = screen.getByText("New File");
    await user.click(fileMenuItem);

    expect(mockCreateFolder).not.toHaveBeenCalled();
  });
});
