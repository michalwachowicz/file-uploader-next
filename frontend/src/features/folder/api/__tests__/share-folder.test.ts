import { shareFolder } from "@/features/folder/api/share-folder";
import { apiRequest } from "@/shared/api/wrapper";
import { Folder } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("shareFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for sharing with duration", async () => {
    const mockFolder: Folder = {
      id: "folder-1",
      name: "Shared Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await shareFolder(
      "folder-1",
      { durationHours: 24 },
      "test-token",
    );

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/folders/folder-1/share",
      data: { durationHours: 24 },
      token: "test-token",
      defaultErrorMessage: "Failed to share folder",
      extractData: expect.any(Function),
    });
    expect(result).toEqual(mockFolder);
  });

  it("calls apiRequest with correct parameters for sharing indefinitely", async () => {
    const mockFolder: Folder = {
      id: "folder-1",
      name: "Shared Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: new Date(
        Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await shareFolder("folder-1", { indefinite: true });

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/folders/folder-1/share",
      data: { indefinite: true },
      token: undefined,
      defaultErrorMessage: "Failed to share folder",
      extractData: expect.any(Function),
    });
    expect(result).toEqual(mockFolder);
  });

  it("calls apiRequest with correct parameters for unsharing", async () => {
    const mockFolder: Folder = {
      id: "folder-1",
      name: "Unshared Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await shareFolder("folder-1", { durationHours: null });

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/folders/folder-1/share",
      data: { durationHours: null },
      token: undefined,
      defaultErrorMessage: "Failed to share folder",
      extractData: expect.any(Function),
    });
    expect(result).toEqual(mockFolder);
  });
});
