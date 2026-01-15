import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/widgets/sidebar/ui/sidebar";
import { FolderNode } from "@file-uploader/shared";
import { getFolderPathIds } from "@/features/folder/lib";

vi.mock("@/widgets/sidebar/ui/add-button", () => ({
  AddButton: ({ currentFolderId }: { currentFolderId?: string }) => (
    <div data-testid='add-button'>AddButton {currentFolderId || "root"}</div>
  ),
}));

vi.mock("@/shared/assets/icons", () => ({
  ArrowDropdownIcon: ({ className }: { className?: string }) => (
    <svg data-testid='arrow-dropdown-icon' className={className} />
  ),
  FolderIcon: ({ className }: { className?: string }) => (
    <svg data-testid='folder-icon' className={className} />
  ),
  FolderSharedIcon: ({ className }: { className?: string }) => (
    <svg data-testid='folder-shared-icon' className={className} />
  ),
}));

vi.mock("@/features/folder/lib", () => ({
  getFolderPathIds: vi.fn(),
}));

describe("Sidebar", () => {
  const createMockFolder = (
    id: string,
    name: string,
    subfolders: FolderNode[] = [],
    shareExpiresAt: Date | string | null = null
  ): FolderNode => ({
    id,
    name,
    ownerId: "user-1",
    parentId: null,
    shareExpiresAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subfolders,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset getFolderPathIds mock to return empty array by default
    vi.mocked(getFolderPathIds).mockReturnValue([]);
  });

  it("renders My Drive folder with empty folders array", () => {
    render(<Sidebar folders={[]} />);

    expect(screen.getByText("My Drive")).toBeInTheDocument();
    expect(screen.getByTestId("add-button")).toBeInTheDocument();
    // My Drive with no subfolders should not have an expand button
    expect(
      screen.queryByLabelText(/^Expand folder My Drive$/)
    ).not.toBeInTheDocument();
  });

  it("renders My Drive with root folders", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [
      createMockFolder("folder-1", "Folder 1"),
      createMockFolder("folder-2", "Folder 2"),
    ];

    render(<Sidebar folders={folders} />);

    expect(screen.getByText("My Drive")).toBeInTheDocument();

    // My Drive needs to be expanded to see folders
    const expandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(expandButton);

    expect(screen.getByText("Folder 1")).toBeInTheDocument();
    expect(screen.getByText("Folder 2")).toBeInTheDocument();
  });

  it("renders nested folders when expanded", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [
      createMockFolder("folder-1", "Folder 1", [
        createMockFolder("subfolder-1", "Subfolder 1"),
      ]),
    ];

    render(<Sidebar folders={folders} />);

    const myDriveLink = screen.getByText("My Drive").closest("a");
    expect(myDriveLink).toBeInTheDocument();
    expect(myDriveLink).toHaveAttribute("href", "/");

    // First expand My Drive
    const myDriveExpandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(myDriveExpandButton);

    // Wait for Folder 1 to appear, then expand it
    await waitFor(() => {
      expect(screen.getByText("Folder 1")).toBeInTheDocument();
    });

    const folder1ExpandButton = screen.getByLabelText("Expand folder Folder 1");
    await user.click(folder1ExpandButton);

    expect(screen.getByText("Subfolder 1")).toBeInTheDocument();
  });

  it("shows shared folder icon for shared folders", async () => {
    const user = userEvent.setup();
    // Create a date far in the future to ensure it's always valid, convert to ISO string
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const folders: FolderNode[] = [
      createMockFolder(
        "folder-1",
        "Shared Folder",
        [],
        futureDate.toISOString()
      ),
    ];

    render(<Sidebar folders={folders} />);

    // Expand My Drive to see folders
    const expandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(expandButton);

    // Wait for the folder to appear, then check for its icon
    await waitFor(() => {
      const sharedFolderLink = screen.getByText("Shared Folder").closest("a");
      expect(sharedFolderLink).toBeInTheDocument();
      const sharedIcon = sharedFolderLink?.querySelector(
        '[data-testid="folder-shared-icon"]'
      );
      expect(sharedIcon).toBeInTheDocument();
    });
  });

  it("shows regular folder icon for non-shared folders", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [
      createMockFolder("folder-1", "Regular Folder"),
    ];

    render(<Sidebar folders={folders} />);

    // Expand My Drive to see folders
    const expandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(expandButton);

    // Wait for the folder to appear, then check for its icon
    await waitFor(() => {
      const regularFolderLink = screen.getByText("Regular Folder").closest("a");
      expect(regularFolderLink).toBeInTheDocument();
      // There will be 2 folder-icons (My Drive and Regular Folder), so we need to check within the link
      const regularIcon = regularFolderLink?.querySelector(
        '[data-testid="folder-icon"]'
      );
      expect(regularIcon).toBeInTheDocument();
    });
  });

  it("shows shared icon for children of shared parent", async () => {
    const user = userEvent.setup();
    // Create a date far in the future to ensure it's always valid, convert to ISO string
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const folders: FolderNode[] = [
      createMockFolder(
        "folder-1",
        "Shared Parent",
        [createMockFolder("subfolder-1", "Child Folder")],
        futureDate.toISOString()
      ),
    ];

    render(<Sidebar folders={folders} />);

    // Expand My Drive
    const myDriveExpandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(myDriveExpandButton);

    // Wait for Shared Parent to appear, then expand it
    await waitFor(() => {
      expect(screen.getByText("Shared Parent")).toBeInTheDocument();
    });

    const sharedParentExpandButton = screen.getByLabelText(
      "Expand folder Shared Parent"
    );
    await user.click(sharedParentExpandButton);

    await waitFor(() => {
      expect(screen.getByText("Child Folder")).toBeInTheDocument();
    });

    // Check that both the parent and child have shared icons
    const sharedParentLink = screen.getByText("Shared Parent").closest("a");
    const sharedChildLink = screen.getByText("Child Folder").closest("a");

    expect(sharedParentLink).toBeInTheDocument();
    expect(sharedChildLink).toBeInTheDocument();

    const parentIcon = sharedParentLink?.querySelector(
      '[data-testid="folder-shared-icon"]'
    );
    const childIcon = sharedChildLink?.querySelector(
      '[data-testid="folder-shared-icon"]'
    );

    expect(parentIcon).toBeInTheDocument();
    expect(childIcon).toBeInTheDocument();
  });

  it("expands parent folders of current folder automatically", async () => {
    // getFolderPathIds should return the full path including the target
    // Set up the mock before render
    vi.mocked(getFolderPathIds).mockReturnValue([
      "folder-1",
      "subfolder-1",
      "subfolder-2",
    ]);

    const folders: FolderNode[] = [
      createMockFolder("folder-1", "Folder 1", [
        createMockFolder("subfolder-1", "Subfolder 1", [
          createMockFolder("subfolder-2", "Subfolder 2"),
        ]),
      ]),
    ];

    render(<Sidebar folders={folders} currentFolderId='subfolder-2' />);

    // My Drive should be expanded automatically (empty string is in requiredExpandedFolders)
    // folder-1 should be expanded (it's in the path, but not the last one)
    // subfolder-1 should be expanded (it's in the path, but not the last one)
    // subfolder-2 should be visible because its parent (subfolder-1) is expanded
    // All should be visible without manual expansion
    await waitFor(
      () => {
        expect(screen.getByText("Folder 1")).toBeInTheDocument();
        expect(screen.getByText("Subfolder 1")).toBeInTheDocument();
        expect(screen.getByText("Subfolder 2")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("allows manual folder expansion", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [
      createMockFolder("folder-1", "Folder 1", [
        createMockFolder("subfolder-1", "Subfolder 1"),
      ]),
    ];

    render(<Sidebar folders={folders} />);

    expect(screen.queryByText("Subfolder 1")).not.toBeInTheDocument();

    // First expand My Drive
    const myDriveExpandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(myDriveExpandButton);

    // Wait for Folder 1 to appear, then expand it
    await waitFor(() => {
      expect(screen.getByText("Folder 1")).toBeInTheDocument();
    });

    const folder1ExpandButton = screen.getByLabelText("Expand folder Folder 1");
    await user.click(folder1ExpandButton);

    expect(screen.getByText("Subfolder 1")).toBeInTheDocument();
  });

  it("allows manual folder collapse", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [
      createMockFolder("folder-1", "Folder 1", [
        createMockFolder("subfolder-1", "Subfolder 1"),
      ]),
    ];

    render(<Sidebar folders={folders} />);

    // First expand My Drive
    const myDriveExpandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(myDriveExpandButton);

    // Wait for Folder 1 to appear, then expand it
    await waitFor(() => {
      expect(screen.getByText("Folder 1")).toBeInTheDocument();
    });

    const folder1ExpandButton = screen.getByLabelText("Expand folder Folder 1");
    await user.click(folder1ExpandButton);

    await waitFor(() => {
      expect(screen.getByText("Subfolder 1")).toBeInTheDocument();
    });

    // Find the collapse button for Folder 1 specifically
    const folder1CollapseButton = screen.getByLabelText(
      "Collapse folder Folder 1"
    );
    await user.click(folder1CollapseButton);

    expect(screen.queryByText("Subfolder 1")).not.toBeInTheDocument();
  });

  it("renders folder links with correct hrefs", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [createMockFolder("folder-1", "Folder 1")];

    render(<Sidebar folders={folders} />);

    // Expand My Drive to see folders
    const expandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(expandButton);

    const folderLink = screen.getByText("Folder 1").closest("a");
    expect(folderLink).toBeInTheDocument();
    expect(folderLink).toHaveAttribute("href", "/folders/folder-1");
  });

  it("passes currentFolderId to AddButton", () => {
    render(<Sidebar folders={[]} currentFolderId='folder-1' />);

    expect(screen.getByText("AddButton folder-1")).toBeInTheDocument();
  });

  it("passes undefined currentFolderId to AddButton when not provided", () => {
    render(<Sidebar folders={[]} />);

    expect(screen.getByText("AddButton root")).toBeInTheDocument();
  });

  it("handles deeply nested folder structures", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [
      createMockFolder("level1", "Level 1", [
        createMockFolder("level2", "Level 2", [
          createMockFolder("level3", "Level 3"),
        ]),
      ]),
    ];

    render(<Sidebar folders={folders} />);

    // First expand My Drive
    const myDriveButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(myDriveButton);

    // Wait for Level 1 to appear, then expand it
    await waitFor(() => {
      expect(screen.getByText("Level 1")).toBeInTheDocument();
    });

    // Find Level 1's expand button by aria-label
    const level1ExpandButton = screen.getByLabelText("Expand folder Level 1");
    await user.click(level1ExpandButton);

    // Wait for Level 2 to appear, then expand it
    await waitFor(() => {
      expect(screen.getByText("Level 2")).toBeInTheDocument();
    });

    const level2ExpandButton = screen.getByLabelText("Expand folder Level 2");
    await user.click(level2ExpandButton);

    await waitFor(() => {
      expect(screen.getByText("Level 3")).toBeInTheDocument();
    });
  });

  it("does not show expand button for folders without subfolders", async () => {
    const user = userEvent.setup();
    const folders: FolderNode[] = [createMockFolder("folder-1", "Folder 1")];

    render(<Sidebar folders={folders} />);

    // Expand My Drive to see the folder
    const expandButton = screen.getByLabelText("Expand folder My Drive");
    await user.click(expandButton);

    // Folder 1 has no subfolders, so it should not have an expand button
    expect(
      screen.queryByLabelText(/^Expand folder Folder 1$/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/^Collapse folder Folder 1$/)
    ).not.toBeInTheDocument();
  });
});
