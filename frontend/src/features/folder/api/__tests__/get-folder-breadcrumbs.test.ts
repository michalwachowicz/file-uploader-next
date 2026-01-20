import { getFolderBreadcrumbs } from "@/features/folder/api/get-folder-breadcrumbs";
import { apiRequest } from "@/shared/api/wrapper";
import { GetFolderBreadcrumbsResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("getFolderBreadcrumbs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    const mockResponse: GetFolderBreadcrumbsResponse = {
      breadcrumbs: [],
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await getFolderBreadcrumbs("folder-1", "test-token");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/folder-1/breadcrumbs",
      token: "test-token",
      defaultErrorMessage: "Failed to fetch folder breadcrumbs",
    });
    expect(result).toEqual(mockResponse);
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    const mockResponse: GetFolderBreadcrumbsResponse = {
      breadcrumbs: [],
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await getFolderBreadcrumbs("folder-1");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/folders/folder-1/breadcrumbs",
      token: undefined,
      defaultErrorMessage: "Failed to fetch folder breadcrumbs",
    });
    expect(result).toEqual(mockResponse);
  });
});
