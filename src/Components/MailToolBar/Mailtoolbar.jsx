import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

import "./Mailtoolbar.css";

const Mailtoolbar = ({emails,selectedEmails, setSelectedEmails, loadEmails,showSnackbar,}) => {
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
  const allSelected = emails.length > 0 && selectedEmails.length === emails.length;
  console.log("allSelected :: ", allSelected);
  
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
        <MenuItem onClick={handleMoreClose}>
          Mark all as read
        </MenuItem>
       <MenuItem onClick={handleMoreClose}>
          Select All
       </MenuItem>
      </Menu>
    </div>
  );
};

export default Mailtoolbar;