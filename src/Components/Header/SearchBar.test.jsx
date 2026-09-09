import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import SearchBar from "./SearchBar";

describe("SearchBar Component", () => {
  
  const setup = (props = {}) =>{
    const defaultProps = {
      search: "",
      setSearch: vi.fn(),
      searchFilter: "all",
      setSearchFilter: vi.fn(),
    };

    const user = userEvent.setup();

    render(
      <SearchBar
        {...defaultProps}
        {...props}
      />
    );

    return {
      user,
      ...defaultProps,
    };
  };

  //  Check Search input is rendered
  test("should render search input", () => {
    setup();

    const searchInput = screen.getByPlaceholderText("Search...");

    expect(searchInput).toBeInTheDocument();
  });

  //  Check input displays the search value
  test("should display the search value", () => {
    setup({
      search: "hello",
    });

    const searchInput = screen.getByPlaceholderText("Search...");

    expect(searchInput).toHaveValue("hello");
  });

  //  Check setSearch is called when typing
  test("should call setSearch when user types in search input", async () => {
    const setSearch = vi.fn();

    const { user } = setup({
      setSearch,
    });

    const searchInput = screen.getByPlaceholderText("Search...");
    await user.type(searchInput, "hello");

    expect(setSearch).toHaveBeenCalled();
    expect(setSearch).toHaveBeenCalledWith("h");
  });

  //  Check search filter is rendered
  test("should render search filter", () => {
    setup();

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    expect(searchFilter).toBeInTheDocument();
  });

  // 5. Check default filter value
  test("should have All selected by default", () => {
    setup();

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    expect(searchFilter).toHaveValue("all");
  });

  // 6. Check selected filter value
  test("should display selected search filter", () => {
    setup({
      searchFilter: "inbox",
    });

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    expect(searchFilter).toHaveValue("inbox");
  });

  // 7. Check setSearchFilter when filter changes
  test("should call setSearchFilter when filter is changed", async () => {
    const setSearchFilter = vi.fn();

    const { user } = setup({
      setSearchFilter,
    });

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    await user.selectOptions(searchFilter, "sent");

    expect(setSearchFilter).toHaveBeenCalledWith("sent");
  });

  // 8. Check all filter options
  test("should contain all search filter options", () => {
    setup();

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    expect(searchFilter).toHaveDisplayValue("All");

    expect(
      screen.getByRole("option", { name: "All" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Inbox" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Sent" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Trash" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Starred" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Spam" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Drafts" })
    ).toBeInTheDocument();
  });

  // 9. Check Inbox selection
  test("should select Inbox filter", async () => {
    const setSearchFilter = vi.fn();

    const { user } = setup({
      setSearchFilter,
    });

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    await user.selectOptions(searchFilter, "inbox");

    expect(setSearchFilter).toHaveBeenCalledWith("inbox");
  });

  // 10. Check Trash selection
  test("should select Trash filter", async () => {
    const setSearchFilter = vi.fn();

    const { user } = setup({
      setSearchFilter,
    });

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    await user.selectOptions(searchFilter, "trash");

    expect(setSearchFilter).toHaveBeenCalledWith("trash");
  });

  // 11. Check Starred selection
  test("should select Starred filter", async () => {
    const setSearchFilter = vi.fn();

    const { user } = setup({
      setSearchFilter,
    });

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    await user.selectOptions(searchFilter, "starred");

    expect(setSearchFilter).toHaveBeenCalledWith("starred");
  });

  // 12. Check Spam selection
  test("should select Spam filter", async () => {
    const setSearchFilter = vi.fn();

    const { user } = setup({
      setSearchFilter,
    });

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    await user.selectOptions(searchFilter, "spam");

    expect(setSearchFilter).toHaveBeenCalledWith("spam");
  });

  // 13. Check Drafts selection
  test("should select Drafts filter", async () => {
    const setSearchFilter = vi.fn();

    const { user } = setup({
      setSearchFilter,
    });

    const searchFilter = screen.getByRole("combobox", {
      name: "Search filter",
    });

    await user.selectOptions(searchFilter, "drafts");
    expect(setSearchFilter).toHaveBeenCalledWith("drafts");
  }); 
});