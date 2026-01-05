import { render, screen } from "@testing-library/react";
import { Input } from "@/shared/ui/input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label='Test Label' id='test-input' name='test-input' />);
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Input id='test-input' />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays error message when error is provided", () => {
    render(<Input label='Test' id='test' error='This is an error' />);
    expect(screen.getByText("This is an error")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<Input id='test' placeholder='Enter text' />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });
});
