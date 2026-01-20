import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { Menu, MenuTrigger, MenuList, MenuItem } from "@/shared/ui/menu";

describe("Menu", () => {
  it("renders menu trigger and list", () => {
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </MenuList>
      </Menu>,
    );

    expect(screen.getByText("Open Menu")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  it("opens menu when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("closes menu when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Menu>
          <MenuTrigger>Open Menu</MenuTrigger>
          <MenuList>
            <MenuItem>Item 1</MenuItem>
          </MenuList>
        </Menu>
        <div>Outside</div>
      </div>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const outside = screen.getByText("Outside");
    await user.click(outside);

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("closes menu when Escape key is pressed", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("supports controlled open state", async () => {
    const { rerender } = render(
      <Menu open={false}>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();

    rerender(
      <Menu open={true}>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("calls onOpenChange when state changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Menu onOpenChange={onOpenChange}>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it("supports defaultOpen prop", () => {
    render(
      <Menu defaultOpen={true}>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});

describe("MenuTrigger", () => {
  it("has correct ARIA attributes", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("opens menu with Enter key", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    trigger.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("opens menu with Space key", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    trigger.focus();
    await user.keyboard(" ");

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("opens menu with ArrowDown key and focuses first item", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        const item1 = screen.getByText("Item 1");
        expect(item1).toHaveFocus();
      },
      { timeout: 100 },
    );
  });

  it("calls custom onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Menu>
        <MenuTrigger onClick={onClick}>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports asChild prop with custom element", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <div data-testid='custom-trigger'>Custom Trigger</div>
        </MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByTestId("custom-trigger");
    expect(trigger).toBeInTheDocument();

    const wrapper = trigger.parentElement;
    expect(wrapper).toHaveAttribute("role", "button");
    expect(wrapper).toHaveAttribute("aria-haspopup", "true");

    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("asChild trigger opens menu with Enter key", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <div data-testid='custom-trigger'>Custom Trigger</div>
        </MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const wrapper = screen.getByTestId("custom-trigger").parentElement;
    wrapper?.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("asChild trigger opens menu with Space key", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger asChild>
          <div data-testid='custom-trigger'>Custom Trigger</div>
        </MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const wrapper = screen.getByTestId("custom-trigger").parentElement;
    wrapper?.focus();
    await user.keyboard(" ");

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });
});

describe("MenuList", () => {
  it("renders when menu is open", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  it("does not render when menu is closed", () => {
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  it("has correct ARIA attributes", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      const list = screen.getByRole("menu");
      expect(list).toHaveAttribute("role", "menu");
    });
  });

  it("renders menu in document.body via portal", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      const list = screen.getByRole("menu");
      expect(list).toBeInTheDocument();
      expect(document.body.contains(list)).toBe(true);
      expect(container.contains(list)).toBe(false);
    });
  });

  it("calculates position for bottom-right", async () => {
    const user = userEvent.setup();
    render(
      <Menu position='bottom-right'>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    const triggerRect = trigger.getBoundingClientRect();
    await user.click(trigger);

    await waitFor(() => {
      const list = screen.getByRole("menu");
      const listRect = list.getBoundingClientRect();
      expect(listRect.top).toBeGreaterThanOrEqual(triggerRect.bottom);
      expect(listRect.right).toBeCloseTo(triggerRect.right, 0);
    });
  });

  it("calculates position for bottom-left", async () => {
    const user = userEvent.setup();
    render(
      <Menu position='bottom-left'>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      const list = screen.getByRole("menu");
      expect(list).toBeInTheDocument();
    });

    const triggerRect = trigger.getBoundingClientRect();
    const list = screen.getByRole("menu");
    const listRect = list.getBoundingClientRect();

    expect(listRect.top).toBeGreaterThanOrEqual(triggerRect.bottom);
    expect(listRect.left).toBeCloseTo(triggerRect.left, 0);
  });

  it("calculates position for top-right", async () => {
    const user = userEvent.setup();
    render(
      <Menu position='top-right'>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      const list = screen.getByRole("menu");
      expect(list).toBeInTheDocument();
    });

    const triggerRect = trigger.getBoundingClientRect();
    const list = screen.getByRole("menu");
    const listRect = list.getBoundingClientRect();
    expect(listRect.bottom).toBeLessThanOrEqual(triggerRect.top);
    expect(listRect.right).toBeCloseTo(triggerRect.right, 0);
  });

  it("calculates position for top-left", async () => {
    const user = userEvent.setup();
    render(
      <Menu position='top-left'>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      const list = screen.getByRole("menu");
      expect(list).toBeInTheDocument();
    });

    const triggerRect = trigger.getBoundingClientRect();
    const list = screen.getByRole("menu");
    const listRect = list.getBoundingClientRect();

    expect(listRect.bottom).toBeLessThanOrEqual(triggerRect.top);
    expect(listRect.left).toBeCloseTo(triggerRect.left, 0);
  });

  it("updates position on window scroll", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    const list = screen.getByRole("menu");

    window.dispatchEvent(new Event("scroll", { bubbles: true }));

    await waitFor(() => {
      expect(list.style.top).toBeTruthy();
      expect(list.style.left).toBeTruthy();
    });
  });

  it("updates position on window resize", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    const list = screen.getByRole("menu");

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.dispatchEvent(new Event("resize"));

    await waitFor(() => {
      const newLeft = list.getBoundingClientRect().left;
      expect(newLeft).toBeGreaterThanOrEqual(0);
    });
  });

  it("keeps menu within viewport boundaries", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ position: "fixed", bottom: "10px", right: "10px" }}>
        <Menu position='bottom-right'>
          <MenuTrigger>Open Menu</MenuTrigger>
          <MenuList>
            <MenuItem>Item 1</MenuItem>
            <MenuItem>Item 2</MenuItem>
            <MenuItem>Item 3</MenuItem>
            <MenuItem>Item 4</MenuItem>
            <MenuItem>Item 5</MenuItem>
          </MenuList>
        </Menu>
      </div>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      const list = screen.getByRole("menu");
      const rect = list.getBoundingClientRect();

      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
      expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
    });
  });
});

describe("MenuItem", () => {
  it("calls onSelect when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem onSelect={onSelect}>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    await user.click(item);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledOnce();
    });
  });

  it("closes menu when clicked", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    await user.click(item);

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("handles disabled state", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem disabled onSelect={onSelect}>
            Disabled Item
          </MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Disabled Item")).toBeInTheDocument();
    });

    const item = screen.getByText("Disabled Item");
    expect(item).toHaveAttribute("aria-disabled", "true");
    expect(item).toHaveAttribute("tabIndex", "-1");

    await user.click(item);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("calls onSelect with Enter key", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem onSelect={onSelect}>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    item.focus();
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("calls onSelect with Space key", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem onSelect={onSelect}>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    item.focus();
    await user.keyboard(" ");

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("calls custom onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSelect = vi.fn();

    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem onClick={onClick} onSelect={onSelect}>
            Item 1
          </MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    await user.click(item);

    await waitFor(() => {
      expect(onClick).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledOnce();
    });
  });

  it("supports keyboard navigation with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
          <MenuItem>Item 3</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const list = screen.getByRole("menu");
    list.focus();

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(screen.getByText("Item 1")).toHaveFocus();
    });

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(screen.getByText("Item 2")).toHaveFocus();
    });

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(screen.getByText("Item 3")).toHaveFocus();
    });

    await user.keyboard("{ArrowUp}");
    await waitFor(() => {
      expect(screen.getByText("Item 2")).toHaveFocus();
    });
  });

  it("has correct role and ARIA attributes", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open Menu</MenuTrigger>
        <MenuList>
          <MenuItem>Item 1</MenuItem>
        </MenuList>
      </Menu>,
    );

    const trigger = screen.getByText("Open Menu");
    await user.click(trigger);

    await waitFor(() => {
      const item = screen.getByText("Item 1");
      expect(item).toHaveAttribute("role", "menuitem");
    });
  });
});

describe("Menu component integration", () => {
  it("throws error when MenuTrigger is used outside Menu", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<MenuTrigger>Trigger</MenuTrigger>);
    }).toThrow("Menu components must be used within a Menu");

    consoleError.mockRestore();
  });

  it("throws error when MenuList is used outside Menu", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(
        <MenuList>
          <MenuItem>Item</MenuItem>
        </MenuList>,
      );
    }).toThrow("Menu components must be used within a Menu");

    consoleError.mockRestore();
  });

  it("throws error when MenuItem is used outside Menu", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<MenuItem>Item</MenuItem>);
    }).toThrow("Menu components must be used within a Menu");

    consoleError.mockRestore();
  });
});
