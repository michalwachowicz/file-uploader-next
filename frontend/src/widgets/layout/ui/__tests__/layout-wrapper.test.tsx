import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { LayoutWrapper } from "@/widgets/layout/ui/layout-wrapper";
import { useFolderAccess } from "@/widgets/folder/lib";
import { FolderNode } from "@file-uploader/shared";

vi.mock("@/widgets/folder/lib", () => ({
  useFolderAccess: vi.fn(),
}));

vi.mock("@/widgets/sidebar/ui", () => ({
  Sidebar: ({
    id,
    folders,
    currentFolderId,
  }: {
    id?: string;
    folders: FolderNode[];
    currentFolderId?: string;
  }) => (
    <aside
      id={id}
      data-testid='sidebar'
      {...(currentFolderId !== undefined && {
        "data-current-folder-id": currentFolderId,
      })}
    >
      Sidebar {folders.length} folders
    </aside>
  ),
  SidebarToggler: ({
    isOpen,
    setIsOpen,
    ariaControls,
  }: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    ariaControls?: string;
  }) => (
    <button
      data-testid='sidebar-toggler'
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-controls={ariaControls}
    >
      Toggle Sidebar
    </button>
  ),
}));

describe("LayoutWrapper", () => {
  const mockFolders: FolderNode[] = [
    {
      id: "folder-1",
      name: "Folder 1",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subfolders: [],
    },
  ];

  const mockNavigation = <div data-testid='navigation'>Navigation</div>;
  const mockChildren = <div data-testid='children'>Page Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when user is not owner", () => {
    beforeEach(() => {
      vi.mocked(useFolderAccess).mockReturnValue({
        isOwner: false,
        currentFolderId: undefined,
        folder: undefined,
      });
    });

    it("renders NoSidebarLayout without sidebar toggler", () => {
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      expect(screen.getByTestId("navigation")).toBeInTheDocument();
      expect(screen.getByTestId("children")).toBeInTheDocument();
      expect(screen.queryByTestId("sidebar-toggler")).not.toBeInTheDocument();
      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    });
  });

  describe("when user is owner", () => {
    beforeEach(() => {
      vi.mocked(useFolderAccess).mockReturnValue({
        isOwner: true,
        currentFolderId: undefined,
        folder: undefined,
      });
    });

    it("renders layout correctly", () => {
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      expect(screen.getByTestId("navigation")).toBeInTheDocument();
      expect(screen.getByTestId("children")).toBeInTheDocument();
      expect(screen.getByTestId("sidebar-toggler")).toBeInTheDocument();
      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    });

    it("renders sidebar when toggled open", async () => {
      const user = userEvent.setup();
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");
      await user.click(toggler);

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    it("hides sidebar when toggled closed", async () => {
      const user = userEvent.setup();
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");

      // Open sidebar
      await user.click(toggler);
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();

      // Close sidebar
      await user.click(toggler);
      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    });

    it("passes folders to Sidebar when rendered", async () => {
      const user = userEvent.setup();
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");
      await user.click(toggler);

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveTextContent("1 folders");
    });

    it("passes currentFolderId to Sidebar when provided", async () => {
      const user = userEvent.setup();
      vi.mocked(useFolderAccess).mockReturnValue({
        isOwner: true,
        currentFolderId: "folder-1",
        folder: mockFolders[0],
      });

      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");
      await user.click(toggler);

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).toHaveAttribute("data-current-folder-id", "folder-1");
    });

    it("passes undefined currentFolderId to Sidebar when not provided", async () => {
      const user = userEvent.setup();
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");
      await user.click(toggler);

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar).not.toHaveAttribute("data-current-folder-id");
    });

    it("passes same sidebarId to SidebarToggler and Sidebar", async () => {
      const user = userEvent.setup();
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");
      const togglerAriaControls = toggler.getAttribute("aria-controls");
      expect(togglerAriaControls).toBeTruthy();

      await user.click(toggler);

      const sidebar = screen.getByTestId("sidebar");
      const sidebarId = sidebar.getAttribute("id");
      expect(sidebarId).toBe(togglerAriaControls);
    });

    it("updates SidebarToggler aria-expanded when sidebar is toggled", async () => {
      const user = userEvent.setup();
      render(
        <LayoutWrapper folders={mockFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");
      expect(toggler).toHaveAttribute("aria-expanded", "false");

      await user.click(toggler);
      expect(toggler).toHaveAttribute("aria-expanded", "true");

      await user.click(toggler);
      expect(toggler).toHaveAttribute("aria-expanded", "false");
    });

    it("renders with multiple folders", async () => {
      const user = userEvent.setup();
      const multipleFolders: FolderNode[] = [
        ...mockFolders,
        {
          id: "folder-2",
          name: "Folder 2",
          ownerId: "user-1",
          parentId: null,
          shareExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subfolders: [],
        },
      ];

      render(
        <LayoutWrapper folders={multipleFolders} navigation={mockNavigation}>
          {mockChildren}
        </LayoutWrapper>
      );

      const toggler = screen.getByTestId("sidebar-toggler");
      await user.click(toggler);

      const sidebar = screen.getByTestId("sidebar");
      expect(sidebar.textContent).toContain("2 folders");
    });
  });
});
