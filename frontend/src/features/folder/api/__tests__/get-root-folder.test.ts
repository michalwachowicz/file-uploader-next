import { getRootFolder } from "@/features/folder/api/get-root-folder";
import { apiRequest } from "@/shared/api/wrapper";
import { GetFolderResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("getRootFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    const mockResponse: GetFolderResponse = {
      folder: {
        id: "root",
        name: "My Drive",
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

    const result = await getRootFolder("test-token");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/root",
      token: "test-token",
      defaultErrorMessage: "Failed to fetch root folder",
    });
    expect(result).toEqual(mockResponse);
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    const mockResponse: GetFolderResponse = {
      folder: {
        id: "root",
        name: "My Drive",
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

    const result = await getRootFolder();

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/root",
      token: undefined,
      defaultErrorMessage: "Failed to fetch root folder",
    });
    expect(result).toEqual(mockResponse);
  });
});
