import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { ProfileMenu } from "@/widgets/profile-menu/ui/profile-menu";
import { useRouter } from "next/navigation";
import { removeUserToken } from "@/features/auth/lib";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/auth/lib", () => ({
  removeUserToken: vi.fn(),
}));

vi.mock("@/widgets/profile-menu/assets/icons", () => ({
  AccountIcon: ({ className }: { className?: string }) => (
    <svg data-testid='account-icon' className={className} />
  ),
}));

describe("ProfileMenu", () => {
  const mockPush = vi.fn();
  const mockUser = {
    id: "123",
    username: "testuser",
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("renders correctly", () => {
    render(<ProfileMenu user={mockUser} />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByTestId("account-icon")).toBeInTheDocument();
  });

  it("renders menu trigger button", () => {
    render(<ProfileMenu user={mockUser} />);

    const trigger = screen.getByText("testuser").closest("button");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
  });

  it("opens menu when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={mockUser} />);

    const trigger = screen.getByText("testuser").closest("button");
    await user.click(trigger!);

    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });

  it("navigates to settings when Settings is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={mockUser} />);

    const trigger = screen.getByText("testuser").closest("button");
    await user.click(trigger!);

    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    const settingsItem = screen.getByText("Settings");
    await user.click(settingsItem);

    expect(mockPush).toHaveBeenCalledWith("/settings");
  });

  it("calls removeUserToken and navigates to login when Logout is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(removeUserToken).mockResolvedValue(undefined);

    render(<ProfileMenu user={mockUser} />);

    const trigger = screen.getByText("testuser").closest("button");
    await user.click(trigger!);

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    const logoutItem = screen.getByText("Logout");
    await user.click(logoutItem);

    await waitFor(() => {
      expect(removeUserToken).toHaveBeenCalledOnce();
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });
});
