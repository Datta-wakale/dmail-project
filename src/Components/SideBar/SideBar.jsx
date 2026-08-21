import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import DraftsIcon from "@mui/icons-material/Drafts";
import DeleteIcon from "@mui/icons-material/Delete";
import { NavLink } from "react-router-dom";
import ReportIcon from "@mui/icons-material/Report";
import "./SideBar.css";

const SideBar = ({ onCompose, open }) => {

  return (
    <aside className={`sidebar ${open ? "" : "sidebar-closed"}`} >
      <button className="compose-btn" onClick={onCompose} >
        <AddIcon />
        <span>Compose</span>
      </button>
      <nav className="sidebar-nav">
        <NavLink to="/inbox"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <InboxIcon />
          <span>Inbox</span>
        </NavLink>
        <NavLink
          to="/spam"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <ReportIcon />
          <span>Spam</span>
        </NavLink>
        <NavLink
          to="/starred"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }>
          <StarBorderIcon />
          <span>Starred</span>
        </NavLink>
        <NavLink
          to="/sent"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }>
          <SendIcon />
          <span>Sent</span>
        </NavLink>
        <NavLink
          to="/drafts"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }>
          <DraftsIcon />
          <span>Drafts</span>
        </NavLink>

        <NavLink
          to="/trash"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          } >
          <DeleteIcon />
          <span>Trash</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default SideBar;