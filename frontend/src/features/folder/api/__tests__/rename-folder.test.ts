import { renameFolder } from "@/features/folder/api/rename-folder";
import { apiRequest } from "@/shared/api/wrapper";
import { Folder } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("renameFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    const mockFolder: Folder = {
      id: "folder-1",
      name: "Renamed Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await renameFolder(
      "folder-1",
      { name: "Renamed Folder" },
      "test-token",
    );

    expect(apiRequest).toHaveBeenCalledWith({
      method: "PUT",
      path: "/folders/folder-1",
      data: { name: "Renamed Folder" },
      token: "test-token",
      defaultErrorMessage: "Failed to rename folder",
      extractData: expect.any(Function),
    });
    expect(result).toEqual(mockFolder);
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    const mockFolder: Folder = {
      id: "folder-2",
      name: "Client Renamed Folder",
      ownerId: "user-2",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await renameFolder("folder-2", {
      name: "Client Renamed Folder",
    });

    expect(apiRequest).toHaveBeenCalledWith({
      method: "PUT",
      path: "/folders/folder-2",
      data: { name: "Client Renamed Folder" },
      token: undefined,
      defaultErrorMessage: "Failed to rename folder",
      extractData: expect.any(Function),
    });
    expect(result).toEqual(mockFolder);
  });
});
