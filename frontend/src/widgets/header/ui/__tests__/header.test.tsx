import { render, screen } from "@testing-library/react";
import { Header } from "@/widgets/header/ui/header";

vi.mock("@/widgets/profile-menu/ui", () => ({
  ProfileMenu: vi.fn(({ user }: { user: { id: string; username: string } }) => (
    <div data-testid='profile-menu'>{user.username}</div>
  )),
}));

describe("Header", () => {
  const mockUser = {
    id: "123",
    username: "testuser",
    createdAt: new Date().toISOString(),
  };

  it("renders header element", () => {
    render(<Header user={mockUser} />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("renders heading as link to home page", () => {
    render(<Header user={mockUser} />);

    const link = screen.getByRole("link", { name: "File Uploader" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders ProfileMenu component and passes user prop", () => {
    render(<Header user={mockUser} />);

    const trigger = screen.getByTestId("profile-menu");
    expect(trigger).toHaveTextContent("testuser");
  });
});
