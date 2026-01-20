import { deleteFolder } from "@/features/folder/api/delete-folder";
import { apiRequest } from "@/shared/api/wrapper";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("deleteFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await deleteFolder("folder-1", "test-token");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "DELETE",
      path: "/folders/folder-1",
      token: "test-token",
      defaultErrorMessage: "Failed to delete folder",
    });
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await deleteFolder("folder-1");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "DELETE",
      path: "/folders/folder-1",
      token: undefined,
      defaultErrorMessage: "Failed to delete folder",
    });
  });
});
