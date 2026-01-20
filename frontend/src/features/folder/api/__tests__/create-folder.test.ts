import { createFolder } from "@/features/folder/api/create-folder";
import { apiRequest } from "@/shared/api/wrapper";
import { Folder } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("createFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    const mockFolder: Folder = {
      id: "new-folder-1",
      name: "New Folder",
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await createFolder({ name: "New Folder" }, "test-token");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/folders",
      data: { name: "New Folder" },
      token: "test-token",
      defaultErrorMessage: "Failed to create folder",
      extractData: expect.any(Function),
    });
    expect(result).toEqual(mockFolder);
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    const mockFolder: Folder = {
      id: "new-folder-2",
      name: "Client Folder",
      ownerId: "user-2",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await createFolder({ name: "Client Folder" });

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/folders",
      data: { name: "Client Folder" },
      token: undefined,
      defaultErrorMessage: "Failed to create folder",
      extractData: expect.any(Function),
    });
    expect(result).toEqual(mockFolder);
  });

  it("calls apiRequest with parentId when provided", async () => {
    const mockFolder: Folder = {
      id: "new-folder-3",
      name: "Child Folder",
      ownerId: "user-1",
      parentId: "parent-folder-1",
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    await createFolder({
      name: "Child Folder",
      parentId: "parent-folder-1",
    });

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/folders",
      data: { name: "Child Folder", parentId: "parent-folder-1" },
      token: undefined,
      defaultErrorMessage: "Failed to create folder",
      extractData: expect.any(Function),
    });
  });
});
