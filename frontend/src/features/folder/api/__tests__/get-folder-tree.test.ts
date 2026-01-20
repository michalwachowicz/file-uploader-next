import { getFolderTree } from "@/features/folder/api/get-folder-tree";
import { apiRequest } from "@/shared/api/wrapper";
import { FolderTreeResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("getFolderTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    const mockResponse: FolderTreeResponse = {
      folders: [],
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await getFolderTree("test-token");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/tree",
      token: "test-token",
      defaultErrorMessage: "Failed to fetch folder tree",
    });
    expect(result).toEqual(mockResponse);
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    const mockResponse: FolderTreeResponse = {
      folders: [],
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await getFolderTree();

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/tree",
      token: undefined,
      defaultErrorMessage: "Failed to fetch folder tree",
    });
    expect(result).toEqual(mockResponse);
  });
});
