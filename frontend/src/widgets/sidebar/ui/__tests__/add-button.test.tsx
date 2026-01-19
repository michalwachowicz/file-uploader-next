import React from "react";
import userEvent from "@testing-library/user-event";
import { Mock } from "vitest";
import { Procedure } from "@vitest/spy";
import { render, screen, waitFor } from "@testing-library/react";
import { AddButton } from "@/widgets/sidebar/ui/add-button";
import { DialogProps } from "@/widgets/folder/ui/dialogs/dialog-props";

const mockOpenFolderDialog = vi.fn();
const mockOpenFileDialog = vi.fn();

type MockDialogProps = DialogProps & {
  testId: string;
  open: Mock<Procedure>;
};

const MockDialog = ({
  ref,
  currentFolderId,
  testId,
  open,
}: MockDialogProps) => {
  React.useImperativeHandle(ref, () => ({ open }));
  return <div data-testid={testId} data-folder-id={currentFolderId ?? ""} />;
};

vi.mock("@/widgets/folder/ui/dialogs", () => {
  const CreateFolderDialog = (props: DialogProps) => (
    <MockDialog
      {...props}
      testId='create-folder-dialog'
      open={mockOpenFolderDialog}
    />
  );
  const UploadFileDialog = (props: DialogProps) => (
    <MockDialog
      {...props}
      testId='upload-file-dialog'
      open={mockOpenFileDialog}
    />
  );

  return {
    CreateFolderDialog,
    UploadFileDialog,
  };
});

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
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe.each([
    {
      dialogName: "CreateFolderDialog",
      testId: "create-folder-dialog",
      menuItemText: "New Folder",
      mockOpen: mockOpenFolderDialog,
    },
    {
      dialogName: "UploadFileDialog",
      testId: "upload-file-dialog",
      menuItemText: "New File",
      mockOpen: mockOpenFileDialog,
    },
  ])("$dialogName", ({ testId, menuItemText, mockOpen }) => {
    it("renders with correct props", () => {
      render(<AddButton currentFolderId='folder-1' />);
      const dialog = screen.getByTestId(testId);
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("data-folder-id", "folder-1");
    });

    it("renders without currentFolderId when not provided", () => {
      render(<AddButton />);

      const dialog = screen.getByTestId(testId);
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("data-folder-id", "");
    });

    it("opens dialog when menu item is selected", async () => {
      const user = userEvent.setup();
      render(<AddButton currentFolderId='folder-1' />);

      const button = screen.getByRole("button", { name: "New item" });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(menuItemText)).toBeInTheDocument();
      });

      const menuItem = screen.getByText(menuItemText);
      await user.click(menuItem);

      expect(mockOpen).toHaveBeenCalledTimes(1);
    });
  });
});
