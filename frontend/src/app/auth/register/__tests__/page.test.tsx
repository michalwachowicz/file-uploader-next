import { render, screen } from "@testing-library/react";
import RegisterPage from "@/app/auth/register/page";

vi.mock("@/features/auth/ui", () => ({
  RegisterForm: () => <div data-testid='register-form' />,
}));

describe("RegisterPage", () => {
  it("renders correctly", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: "Register" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });
});
