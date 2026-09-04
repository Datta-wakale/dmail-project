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
import { restoreSpamEmail } from "../../authApi/restoreEmail";
import { unsnoozeEmail } from "../../authApi/UnSnoozeEmail";
import { updateEmail } from "../../authApi/updateEmail";
import "./Mailtoolbar.css";

const Mailtoolbar = ({ emails, selectedEmails, setSelectedEmails, loadEmails, showSnackbar, folder, setEmails, }) => {
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [selectAnchorEl, setSelectAnchorEl] = useState(null);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const selectedCount = selectedEmails.length;
  const hasSelection = selectedCount > 0;
  const { loggedInUser } = useContext(UserContext);
  const selectedEmailObjects = selectedEmails
    .map((id) => emails.find((email) => String(email.id) === String(id)))
    .filter(Boolean);

  const allSelectedAreRead =
    selectedEmailObjects.length > 0 &&
    selectedEmailObjects.every((email) => email.read === true);
  const moreOpen = Boolean(moreAnchorEl);

  const getSelectedEmailById = (id) => emails.find((item) => String(item.id) === String(id));

  const getEffectiveFolderForEmail = (email) => {
    if (!email) {
      return null;
    }

    //  determine the actual folder from the email.
    if (
      folder === "starred" ||
      folder === "starred-received" ||
      folder === "starred-sent"
    ) {
      if (email.from === loggedInUser?.email) {
        return email.senderFolder || "sent";
      }

      if (folder === "all-mail") {
        if (email.from === loggedInUser?.email) {
          return email.senderFolder || "sent";
        }
        return email.receiverFolder || "inbox";
      }

      return email.receiverFolder || "inbox";
    }

    // Normal real folders
    if (["inbox", "sent", "spam", "trash", "draft", "archive",].includes(folder)) {
      return folder;
    }
    // Fallback
    if (email.from === loggedInUser?.email) {
      return email.senderFolder || "sent";
    }
    return email.receiverFolder || "inbox";
  };

  const getRestoreFolderForEmail = (email) => {
    if (email?.from === loggedInUser?.email) {
      if (["inbox", "sent", "spam", "trash", "draft", "archive"].includes(folder)) {
        return folder === "spam" ? "spam" : "sent";
      }
      return email.senderFolder === "spam" ? "spam" : "sent";
    }

    if (["inbox", "sent", "spam", "trash", "draft", "archive"].includes(folder)) {
      return folder === "spam" ? "spam" : "inbox";
    }

    return email?.receiverFolder === "spam" ? "spam" : "inbox";
  };

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
      const archivedItems = selectedEmails
        .map((id) => getSelectedEmailById(id))
        .filter(Boolean);

      if (archivedItems.length === 0) {
        return;
      }

      // Save original state for Undo
      const originalEmails = archivedItems.map((email) => ({
        ...email,
      }));

      // Determine the REAL folder for each email
      const archivedResults = await Promise.all(
        archivedItems.map((email) => {
          const realFolder = getEffectiveFolderForEmail(email);

          return archiveEmail(
            email.id,
            realFolder
          );
        })
      );

      const archivedMap = Object.fromEntries(
        archivedResults.map((item) => [
          String(item.id),
          item,
        ])
      );

      // Update local state
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          archivedMap[String(email.id)] || email
        )
      );

      setSelectedEmails([]);
      // Undo
      showSnackbar("Emails Archived", async () => {
        try {
          const restored = await Promise.all(
            originalEmails.map((originalEmail) =>
              updateEmail(
                originalEmail.id,
                originalEmail
              )
            )
          );

          const restoredMap = Object.fromEntries(
            restored.map((item) => [
              String(item.id),
              item,
            ])
          );

          setEmails((prevEmails) =>
            prevEmails.map((email) =>
              restoredMap[String(email.id)] || email
            )
          );
        } catch (error) {
          console.error(
            "Unable to undo archive selected emails",
            error
          );
        }
      });

    } catch (error) {
      console.error("Error handling archive:", error);
      showSnackbar("Unable to archive emails");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const deletedItems = selectedEmails
        .map((id) => getSelectedEmailById(id))
        .filter(Boolean);

      if (deletedItems.length === 0) {
        return;
      }

      // Save original state for Undo
      const originalEmails = deletedItems.map((email) => ({
        ...email,
      }));

      // Determine the REAL folder for every selected email
      const deletedResults = await Promise.all(
        deletedItems.map((email) => {
          const realFolder = getEffectiveFolderForEmail(email);

          // Starred is a VIEW, not a real folder
          const isStarredView = folder === "starred" ||
            folder === "starred-received" ||
            folder === "starred-sent";

          return deleteEmail(email.id, realFolder, isStarredView);
        })
      );

      const deletedMap = Object.fromEntries(
        deletedResults.map((item) => [
          String(item.id),
          item,
        ])
      );

      // Update local state
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          deletedMap[String(email.id)] || email
        )
      );

      setSelectedEmails([]);

      showSnackbar("Emails moved to Trash",
        async () => {
          try {
            // Restore EXACT original state
            const restored = await Promise.all(
              originalEmails.map((originalEmail) =>
                updateEmail(originalEmail.id, originalEmail)
              )
            );

            const restoredMap = Object.fromEntries(
              restored.map((item) => [
                String(item.id),
                item,
              ])
            );

            setEmails((prevEmails) =>
              prevEmails.map((email) =>
                restoredMap[String(email.id)] || email
              )
            );
          } catch (error) {
            console.error(
              "Unable to undo delete selected emails",
              error
            );
          }
        }
      );
    } catch (error) {
      console.error("Unable to delete selected emails", error);
      showSnackbar("Unable to delete emails");
    }
  };

  const handleSpamSelected = async () => {
    try {
      const spamItems = selectedEmails
        .map((id) => getSelectedEmailById(id))
        .filter(Boolean);
      if (spamItems.length === 0) {
        return;
      }

      // Move selected emails to Spam
      const spamResults = await Promise.all(
        spamItems.map((email) =>
          moveEmailToSpam(email.id, getEffectiveFolderForEmail(email))
        )
      );

      console.log("Moved to spam:", spamResults);

      // Remove them from the current folder
      setEmails((prevEmails) =>
        prevEmails.filter(
          (email) =>
            !spamItems.some(
              (spamEmail) =>
                String(spamEmail.id) === String(email.id))
        )
      );

      // Clear selection
      setSelectedEmails([]);

      // Snackbar + Undo
      showSnackbar("Emails moved to Spam", async () => {
        try {
          const restored = await Promise.all(
            spamItems.map((email) =>
              restoreSpamEmail(email.id)
            )
          );

          console.log("Restored from spam:", restored);
          // Put restored emails back into current folder
          setEmails((prevEmails) => {
            const existingIds = new Set(
              prevEmails.map((email) => String(email.id))
            );

            const restoredEmails = restored.filter(
              (email) =>
                !existingIds.has(String(email.id))
            );

            return [
              ...restoredEmails,
              ...prevEmails,
            ];
          });
        } catch (error) {
          console.error("Unable to undo spam selected emails:", error);
        }
      });
    } catch (error) {
      console.error(
        "Unable to move selected emails to spam:",
        error
      );

      showSnackbar("Unable to move emails to Spam");
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
      const snoozedItems = selectedEmails.map((id) => getSelectedEmailById(id)).filter(Boolean);
      const snoozedResults = await Promise.all(
        snoozedItems.map((email) => {
          const resolvedFolder = getEffectiveFolderForEmail(email);
          return snoozeEmail(email.id, resolvedFolder, snoozedUntil);
        })
      );

      const snoozedMap = Object.fromEntries(
        snoozedResults.map((item) => [String(item.id), item])
      );

      setEmails((prev) => prev.map((email) => snoozedMap[String(email.id)] || email));

      setSelectedEmails([]);
      setSnoozeOpen(false);
      showSnackbar("Emails snoozed", async () => {
        try {
          const restored = await Promise.all(
            snoozedItems.map((email) => unsnoozeEmail(email.id, getRestoreFolderForEmail(email)))
          );
          const restoredMap = Object.fromEntries(
            restored.map((item) => [String(item.id), item])
          );

          setEmails((prev) =>
            prev.map((email) => restoredMap[String(email.id)] || email)
          );
        } catch (error) {
          console.error("Unable to undo snooze selected emails", error);
        }
      });
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
          {folder !== "archive" && folder !== "trash" && folder !== "drafts" &&
            <Tooltip title="Archive">
              <IconButton onClick={handleArchiveSelected}>
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          }


          {folder !== "spam" && folder !== "drafts" && folder !== "trash" && (
            <Tooltip title="Report spam">
              <IconButton onClick={handleSpamSelected}>
                <ReportIcon />
              </IconButton>
            </Tooltip>
          )}


          <Tooltip title="Delete">
            <IconButton onClick={handleDeleteSelected}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          {allSelectedAreRead ? (
            <Tooltip title="Mark as unread">
              <IconButton onClick={() => handleMarkSelected(false)}>
                <MarkEmailUnreadIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Mark as read">
              <IconButton onClick={() => handleMarkSelected(true)}>
                <MarkEmailReadIcon />
              </IconButton>
            </Tooltip>
          )}

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
                }));
              setSelectedEmails([]);
            }} />
          <Tooltip title="Snooze">
            <IconButton onClick={() => setSnoozeOpen(true)}>
              <SnoozeIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <SnoozeDialog open={snoozeOpen}
        onClose={() => setSnoozeOpen(false)}
        onSnooze={handleSnoozeSelected} />

    </div>
  );
};
export default Mailtoolbar;