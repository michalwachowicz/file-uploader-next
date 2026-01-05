import { render, screen } from "@testing-library/react";
import { Button, buttonVariantClasses } from "@/shared/ui/button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders with primary variant by default", () => {
    render(<Button>Primary</Button>);
    expect(screen.getByText("Primary")).toBeInTheDocument();
  });

  it("renders with error variant", () => {
    render(<Button variant='error'>Delete</Button>);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("applies primary variant classes", () => {
    render(<Button variant='primary'>Primary</Button>);
    const button = screen.getByText("Primary");
    expect(button.className).toContain(buttonVariantClasses.primary);
  });

  it("applies error variant classes", () => {
    render(<Button variant='error'>Delete</Button>);
    const button = screen.getByText("Delete");
    expect(button.className).toContain(buttonVariantClasses.error);
  });

  it("renders as disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText("Disabled");
    expect(button).toBeDisabled();
  });

  it("renders with custom type", () => {
    render(<Button type='submit'>Submit</Button>);
    const button = screen.getByText("Submit");
    expect(button).toHaveAttribute("type", "submit");
  });
});
