import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("Logo Component", () => {
    
  test("should display DMail logo", () => {
    useNavigate.mockReturnValue(vi.fn());
    render(<Logo />);
    const logoText = screen.getByText("DMail");
    expect(logoText).toBeInTheDocument();
  });

  test("should navigate to inbox when logo is clicked", async () => {
    const user = userEvent.setup();
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    render(<Logo />);
    const logoText = screen.getByText("DMail");
    await user.click(logoText);
    expect(mockNavigate).toHaveBeenCalledWith("/inbox");
  });
});