import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RegisterForm } from "@/features/auth/ui/register-form";
import { register } from "@/features/auth/api";
import { useRouter } from "next/navigation";

vi.mock("@/features/auth/api", () => ({
  register: vi.fn(),
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

vi.mock("@/features/auth/ui/password-requirements", () => ({
  PasswordRequirements: ({ password }: { password: string }) => (
    <div data-testid='password-requirements'>Password: {password}</div>
  ),
}));

describe("RegisterForm", () => {
  const mockPush = vi.fn();
  const mockRegister = vi.mocked(register);

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
    render(<RegisterForm />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });

  it("shows validation error for empty username", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", { name: "Create account" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Username must be at least 3 characters")
      ).toBeInTheDocument();
    });
  });

  it("shows validation error for password mismatch", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm Password"), "Different123!");

    const submitButton = screen.getByRole("button", { name: "Create account" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("updates password requirements when password changes", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "test");

    await waitFor(() => {
      expect(screen.getByTestId("password-requirements")).toHaveTextContent(
        "Password: test"
      );
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      user: { id: "1", username: "testuser", createdAt: new Date() },
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm Password"), "Password123!");

    const submitButton = screen.getByRole("button", { name: "Create account" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: "testuser",
        password: "Password123!",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("shows error message on registration failure", async () => {
    const user = userEvent.setup();
    const errorMessage = "Username already exists";
    mockRegister.mockRejectedValue(new Error(errorMessage));

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Username"), "existinguser");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm Password"), "Password123!");

    const submitButton = screen.getByRole("button", { name: "Create account" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    let resolveRegister: (value: Awaited<ReturnType<typeof register>>) => void;
    const registerPromise = new Promise<Awaited<ReturnType<typeof register>>>(
      (resolve) => {
        resolveRegister = resolve;
      }
    );
    mockRegister.mockReturnValue(registerPromise);

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm Password"), "Password123!");

    const submitButton = screen.getByRole("button", { name: "Create account" });
    await user.click(submitButton);

    expect(
      screen.getByRole("button", { name: "Creating account..." })
    ).toBeDisabled();

    resolveRegister!({
      user: { id: "1", username: "testuser", createdAt: new Date() },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Create account" })
      ).toBeInTheDocument();
    });
  });

  it("clears error when submitting again after error", async () => {
    const user = userEvent.setup();
    mockRegister
      .mockRejectedValueOnce(new Error("Username already exists"))
      .mockResolvedValueOnce({
        user: { id: "1", username: "newuser", createdAt: new Date() },
      });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Username"), "existinguser");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm Password"), "Password123!");

    const submitButton = screen.getByRole("button", { name: "Create account" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "newuser");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Username already exists")
      ).not.toBeInTheDocument();
    });
  });
});
