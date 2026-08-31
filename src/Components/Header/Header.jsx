import Logo from "./Logo";
import NavButtons from "./NavButtons";
import "./Header.css";
import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import SearchBar from "./SearchBar";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton"
const Header = ({ sidebarOpen, handleToggleSidebar, search, setSearch, searchFilter, setSearchFilter }) => {
  const { loggedInUser } = useContext(UserContext);

  return (
    <header className="header-container">
      <div className="header-left">
        {loggedInUser && (
          <IconButton
            onClick={handleToggleSidebar}
            className={`menu-toggle ${sidebarOpen ? "menu-open" : ""}`}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Logo />
      </div>

      {loggedInUser && (
        <SearchBar
          search={search}
          setSearch={setSearch}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
      )}
      <NavButtons key={loggedInUser?.email || "logged-out"} />
    </header>
  );
};

export default Header;
