import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { PasswordField } from "@/features/auth/ui";

vi.mock("@/features/auth/assets/icons", () => ({
  VisibilityIcon: () => <svg data-testid='visibility-icon' />,
  VisibilityOffIcon: () => <svg data-testid='visibility-off-icon' />,
}));

describe("PasswordField", () => {
  it("renders password input by default", () => {
    render(<PasswordField id='password' name='password' label='Password' />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("shows visibility icon by default", () => {
    render(<PasswordField id='password' name='password' />);
    expect(screen.getByTestId("visibility-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("visibility-off-icon")).not.toBeInTheDocument();
  });

  it("toggles password visibility when button is clicked", async () => {
    const user = userEvent.setup();
    render(<PasswordField id='password' name='password' label='Password' />);

    const button = screen.getByRole("button");
    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByTestId("visibility-icon")).toBeInTheDocument();

    await user.click(button);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByTestId("visibility-off-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("visibility-icon")).not.toBeInTheDocument();

    await user.click(button);
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByTestId("visibility-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("visibility-off-icon")).not.toBeInTheDocument();
  });
});
