import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { LoginForm } from "@/features/auth/ui/login-form";
import { login } from "@/features/auth/api";
import { useRouter } from "next/navigation";

vi.mock("@/features/auth/api", () => ({
  login: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/features/auth/ui/password-field", async () => {
  const { Input } = await import("@/shared/ui/input");
  return {
    PasswordField: Input,
  };
});

describe("LoginForm", () => {
  const mockPush = vi.fn();
  const mockLogin = vi.mocked(login);

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

  it("renders form with username and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("renders link to register page", () => {
    render(<LoginForm />);
    const registerLink = screen.getByRole("link", { name: "Sign up" });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/auth/register");
  });

  it("shows validation error for empty username", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
    });
  });

  it("shows validation error for empty password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText("Username");
    await user.type(usernameInput, "testuser");

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      user: { id: "1", username: "testuser", createdAt: new Date() },
      token: "test-token",
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "password123");

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows error message on login failure", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid credentials";
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: Awaited<ReturnType<typeof login>>) => void;
    const loginPromise = new Promise<Awaited<ReturnType<typeof login>>>(
      (resolve) => {
        resolveLogin = resolve;
      }
    );
    mockLogin.mockReturnValue(loginPromise);

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "password123");

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await user.click(submitButton);

    expect(
      screen.getByRole("button", { name: "Logging in..." })
    ).toBeDisabled();

    resolveLogin!({
      user: { id: "1", username: "testuser", createdAt: new Date() },
      token: "test-token",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Log in" })
      ).toBeInTheDocument();
    });
  });

  it("clears error when submitting again after error", async () => {
    const user = userEvent.setup();
    mockLogin
      .mockRejectedValueOnce(new Error("Invalid credentials"))
      .mockResolvedValueOnce({
        user: { id: "1", username: "testuser", createdAt: new Date() },
        token: "test-token",
      });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");

    const submitButton = screen.getByRole("button", { name: "Log in" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "correctpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
    });
  });
});
