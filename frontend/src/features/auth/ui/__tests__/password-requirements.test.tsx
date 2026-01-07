import { render, screen } from "@testing-library/react";
import { PasswordRequirements } from "@/features/auth/ui";

const REQUIREMENT_LABELS = {
  LENGTH: "At least 8 characters",
  LOWERCASE: "At least one lowercase letter",
  UPPERCASE: "At least one uppercase letter",
  NUMBER: "At least one number",
  SPECIAL: "At least one special character",
} as const;

const getRequirementAriaLabel = (label: string, met: boolean): RegExp => {
  return new RegExp(`${label}: requirement ${met ? "met" : "not met"}`, "i");
};

describe("PasswordRequirements", () => {
  it("does not render when all requirements are met", () => {
    const { container } = render(<PasswordRequirements password='Test123!' />);
    expect(container.firstChild).toBeNull();
  });

  it("renders when password is empty", () => {
    render(<PasswordRequirements password='' />);
    expect(
      screen.getByRole("region", { name: "Password requirements" })
    ).toBeInTheDocument();
  });

  it("renders when some requirements are not met", () => {
    render(<PasswordRequirements password='test' />);
    expect(
      screen.getByRole("region", { name: "Password requirements" })
    ).toBeInTheDocument();
  });

  it("shows all requirements as unmet for empty password", () => {
    render(<PasswordRequirements password='' />);

    Object.values(REQUIREMENT_LABELS).forEach((label) => {
      expect(
        screen.getByRole("listitem", {
          name: getRequirementAriaLabel(label, false),
        })
      ).toBeInTheDocument();
    });

    const checkmarks = screen.queryAllByText("✓");
    expect(checkmarks).toHaveLength(0);
  });

  it("displays checkmark for met requirements", () => {
    render(<PasswordRequirements password='Test123' />);
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks).toHaveLength(3);
  });

  it.each([
    {
      label: REQUIREMENT_LABELS.LOWERCASE,
      unmetPassword: "UPPERCASE",
      metPassword: "lowercase",
    },
    {
      label: REQUIREMENT_LABELS.UPPERCASE,
      unmetPassword: "lowercase",
      metPassword: "UPPERCASE",
    },
    {
      label: REQUIREMENT_LABELS.NUMBER,
      unmetPassword: "NoNumbers",
      metPassword: "Has123",
    },
    {
      label: REQUIREMENT_LABELS.SPECIAL,
      unmetPassword: "NoSpecial123",
      metPassword: "Has!@#",
    },
  ])(
    "shows correct status for $label requirement",
    ({ label, unmetPassword, metPassword }) => {
      const { rerender } = render(
        <PasswordRequirements password={unmetPassword} />
      );
      expect(
        screen.getByRole("listitem", {
          name: getRequirementAriaLabel(label, false),
        })
      ).toBeInTheDocument();

      rerender(<PasswordRequirements password={metPassword} />);
      expect(
        screen.getByRole("listitem", {
          name: getRequirementAriaLabel(label, true),
        })
      ).toBeInTheDocument();
    }
  );
});
