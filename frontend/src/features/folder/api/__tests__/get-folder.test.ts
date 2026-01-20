import { getFolder } from "@/features/folder/api/get-folder";
import { apiRequest } from "@/shared/api/wrapper";
import { GetFolderResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("getFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    const mockResponse: GetFolderResponse = {
      folder: {
        id: "folder-1",
        name: "Test Folder",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subfolders: [],
        files: [],
      },
      isOwner: true,
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await getFolder("folder-1", "test-token");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/folder-1",
      token: "test-token",
      defaultErrorMessage: "Failed to fetch folder",
    });
    expect(result).toEqual(mockResponse);
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    const mockResponse: GetFolderResponse = {
      folder: {
        id: "folder-2",
        name: "Client Folder",
        ownerId: "user-2",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subfolders: [],
        files: [],
      },
      isOwner: true,
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await getFolder("folder-2");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/folder-2",
      token: undefined,
      defaultErrorMessage: "Failed to fetch folder",
    });
    expect(result).toEqual(mockResponse);
  });
});
