import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import ArchiveIcon from "@mui/icons-material/Archive";
import ReportIcon from "@mui/icons-material/Report";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import SnoozeIcon from "@mui/icons-material/Snooze";
import MoveToMenu from "../MoveTo/MoveTo";
import SnoozeDialog from "../SnoozeDialoge/SnoozeDialog";
import { deleteEmail, archiveEmail, moveEmailToSpam, snoozeEmail } from "../../authApi/emailsApi";
import { updateEmail } from "../../authApi/updateEmail";
import "./Mailtoolbar.css";

const Mailtoolbar = ({ emails, selectedEmails, setSelectedEmails, loadEmails, showSnackbar, folder, setEmails, }) => {
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [selectAnchorEl, setSelectAnchorEl] = useState(null);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const selectedCount = selectedEmails.length;
  const hasSelection = selectedCount > 0;
  const { loggedInUser } = useContext(UserContext);
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
  const handleArchiveSelected = async () => {
    try {
      await Promise.all(
        selectedEmails.map((id) => archiveEmail(id, folder))
      );

      setEmails((prev) =>
        prev.filter((email) => !selectedEmails.includes(email.id))
      );

      setSelectedEmails([]);
      showSnackbar("Emails archived");
    } catch (error) {
      console.error("Unable to archive selected emails", error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedEmails.map((id) => deleteEmail(id, folder))
      );

      setEmails((prev) =>
        prev.map((email) => {
          if (!selectedEmails.includes(email.id)) {
            return email;
          }

          if (folder === "sent") {
            return { ...email, senderFolder: "trash" };
          }

          return { ...email, receiverFolder: "trash" };
        })
      );

      setSelectedEmails([]);
      showSnackbar("Emails moved to Trash");
    } catch (error) {
      console.error("Unable to delete selected emails", error);
    }
  };

  const handleSpamSelected = async () => {
    try {
      await Promise.all(
        selectedEmails.map((id) => moveEmailToSpam(id, folder))
      );

      await loadEmails();

      setSelectedEmails([]);
      showSnackbar("Emails moved to Spam");
    } catch (error) {
      console.error("Unable to move selected emails to spam", error);
    }
  };

  const handleMarkSelected = async (read) => {
    try {
      await Promise.all(
        selectedEmails.map((id) => {
          const email = emails.find((item) => item.id === id);

          return updateEmail(id, {
            ...email,
            read,
          });
        })
      );

      setEmails((prev) =>
        prev.map((email) =>
          selectedEmails.includes(email.id)
            ? { ...email, read }
            : email
        )
      );

      setSelectedEmails([]);
      showSnackbar(read ? "Emails marked as read" : "Emails marked as unread");
    } catch (error) {
      console.error("Unable to update selected emails", error);
    }
  };

  const handleSnoozeSelected = async (snoozedUntil) => {
    try {
      await Promise.all(
        selectedEmails.map((id) => {
          const email = emails.find((item) => String(item.id) === String(id));
          const resolvedFolder = email?.from === loggedInUser?.email ? "sent" : "inbox";
          return snoozeEmail(id, resolvedFolder, snoozedUntil);
        })
      );

      setSelectedEmails([]);
      setSnoozeOpen(false);
      showSnackbar("Emails snoozed");
    } catch (error) {
      console.error("Unable to snooze selected emails", error);
      showSnackbar("Unable to snooze emails");
    }
  };


  return (
    <div className="mail-toolbar">
      <Tooltip title="Select">
        <Checkbox
          checked={allSelected}
          indeterminate={
            selectedEmails.length > 0 &&
            selectedEmails.length < emails.length
          }
          onChange={handleSelectAll}
        />
      </Tooltip>

      <IconButton
        size="small"
        onClick={(event) => setSelectAnchorEl(event.currentTarget)}
      >
        ▾
      </IconButton>

      <Menu
        anchorEl={selectAnchorEl}
        open={Boolean(selectAnchorEl)}
        onClose={() => setSelectAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setSelectedEmails(emails.map((email) => email.id));
            setSelectAnchorEl(null);
          }}
        >
          All
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSelectedEmails(
              emails.filter((email) => email.read).map((email) => email.id)
            );
            setSelectAnchorEl(null);
          }}
        >
          Read
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSelectedEmails(
              emails.filter((email) => !email.read).map((email) => email.id)
            );
            setSelectAnchorEl(null);
          }}
        >
          Unread
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSelectedEmails(
              emails.filter((email) => email.starred).map((email) => email.id)
            );
            setSelectAnchorEl(null);
          }}
        >
          Starred
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSelectedEmails(
              emails.filter((email) => !email.starred).map((email) => email.id)
            );
            setSelectAnchorEl(null);
          }} >
          Unstarred
        </MenuItem>
      </Menu>


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
      {hasSelection && (
        <>
          <Tooltip title="Archive">
            <IconButton onClick={handleArchiveSelected}>
              <ArchiveIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Report spam">
            <IconButton onClick={handleSpamSelected}>
              <ReportIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton onClick={handleDeleteSelected}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Mark as read">
            <IconButton onClick={() => handleMarkSelected(true)}>
              <MarkEmailReadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Mark as unread">
            <IconButton onClick={() => handleMarkSelected(false)}>
              <MarkEmailUnreadIcon />
            </IconButton>
          </Tooltip>

<MoveToMenu
    selectedEmails={selectedEmails}
    emails={emails}
    folder={folder}
    loggedInUser={loggedInUser}
    onMove={(updatedEmails) => {

        setEmails((prevEmails) =>
            prevEmails.map((email) => {

                const updatedEmail = updatedEmails.find(
                    (updated) =>
                        String(updated.id) ===
                        String(email.id)
                );

                return updatedEmail || email;
            }) );
        setSelectedEmails([]);
    }}
/>
          <Tooltip title="Snooze">
            <IconButton onClick={() => setSnoozeOpen(true)}>
              <SnoozeIcon />
            </IconButton>
          </Tooltip>
        </>
      )}

      <SnoozeDialog
        open={snoozeOpen}
        onClose={() => setSnoozeOpen(false)}
        onSnooze={handleSnoozeSelected}
      />

    </div>
  );
};
export default Mailtoolbar;