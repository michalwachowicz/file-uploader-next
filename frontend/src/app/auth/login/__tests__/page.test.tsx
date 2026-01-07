import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/auth/login/page";

vi.mock("@/features/auth/ui", () => ({
  LoginForm: () => <div data-testid='login-form' />,
}));

describe("LoginPage", () => {
  it("renders correctly", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
