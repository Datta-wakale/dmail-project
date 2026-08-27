import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

import "./Mailtoolbar.css";
import { updateEmail } from "../../authApi/updateEmail";

const Mailtoolbar = ({ emails, selectedEmails, setSelectedEmails, loadEmails, showSnackbar, }) => {
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const moreOpen = Boolean(moreAnchorEl);
  // Select all visible emails
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedEmails(emails.map((email) => email.id));
    } else {
      setSelectedEmails([]);
    }
  };
  // refresh
  const handleRefresh = async () => {
    try {
      showSnackbar("Refreshing...");
      console.log("before calling");
      await loadEmails();
      console.log("load-dmail is loaded");
      showSnackbar("Loading");
    } catch (error) {
      console.error("Unable to refresh dmails", error);
      showSnackbar("unable to refresh dmails");
    }
  };
  // More menu
  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };
  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };
  const handleSelectFromMenu = () => {
    setSelectedEmails(emails.map((email) => email.id));
    handleMoreClose();
    showSnackbar("All dmails are selected");
  }

  const allSelected = emails.length > 0 && selectedEmails.length === emails.length;
  console.log("allSelected :: ", allSelected);

 const handleMarkAllAsRead = async () => {
  try {
    await Promise.all(
      emails
        .filter((email) => !email.read)
        .map((email) =>
          updateEmail(email.id, {
            ...email,
            read: true,
          })
        )
    );
    await loadEmails();
    handleMoreClose();
    showSnackbar("All emails marked as read");
  } catch (error) {
    console.error("Unable to mark all emails as read:", error);
    showSnackbar("Unable to mark emails as read");
  }
};


  return (
    <div className="mail-toolbar">
      <Tooltip title="Select">
        <Checkbox checked={allSelected}
          indeterminate={
            selectedEmails.length > 0 &&
            selectedEmails.length < emails.length
          }
          onChange={handleSelectAll} />
      </Tooltip>

      {/* Refresh */}
      <Tooltip title="Refresh">
        <IconButton onClick={handleRefresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      {/* More */}
      <Tooltip title="More">
        <IconButton onClick={handleMoreClick}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      {/* More menu */}
      <Menu anchorEl={moreAnchorEl} open={moreOpen}
        onClose={handleMoreClose}>
        <MenuItem onClick={handleMarkAllAsRead}>
          Mark all as read
        </MenuItem>
        <MenuItem onClick={handleSelectFromMenu}>
          Select All
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Mailtoolbar;