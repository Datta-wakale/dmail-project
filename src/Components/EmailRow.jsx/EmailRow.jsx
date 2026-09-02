import { useContext, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { useOutletContext } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import SnoozeIcon from "@mui/icons-material/Snooze";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { deleteEmail, toggleStarEmail, permanentlyDeleteEmail, archiveEmail, snoozeEmail } from "../../authApi/emailsApi";
import { restoreArchivedEmail } from "../../authApi/restoreEmail";
import { restoreEmail } from "../../authApi/restoreEmail";
import { unsnoozeEmail } from "../../authApi/UnSnoozeEmail";
import { formatMailDate, getReceiverDisplayLabel, getSenderDisplayLabel } from "../../Utils/mailUtils";
import "./EmailRow.css";
import SnoozeDialog from "../SnoozeDialoge/SnoozeDialog";
import { updateEmail } from "../../authApi/updateEmail";
const EmailRow = ({ email, folder }) => {
  const { loggedInUser } = useContext(UserContext);
  const { setEmails, openSelectedMail, selectedEmails,
    setSelectedEmails,
    showSnackbar,
    setDraftToEdit } = useOutletContext();

  // Check whether this email is selected
  const isSelected = selectedEmails.includes(email.id);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  // Checkbox
  const handleCheckboxChange = (event) => {
    event.stopPropagation();

    const checked = event.target.checked;

    if (checked) {
      setSelectedEmails((prev) => [...prev, email.id]);
    } else {
      setSelectedEmails((prev) => prev.filter((id) => id !== email.id));
    }
  };

  // Star
  const handleStar = async (event) => {
    event.stopPropagation();

    const newStarredValue = !email.starred;
    try {
      await toggleStarEmail(email.id, newStarredValue);
      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? {
              ...item,
              starred: newStarredValue,
            }
            : item,
        ),
      );
    } catch (error) {
      console.error("Unable to update star", error);
    }
  };

  const handleDelete = async (event) => {
    event.stopPropagation();
    try {
      // Trash → permanently delete
      if (folder === "trash") {
        await permanentlyDeleteEmail(email.id);
        setEmails((prevEmails) =>
          prevEmails.filter((item) => item.id !== email.id)
        );
        setSelectedEmails((prev) =>
          prev.filter((id) => id !== email.id)
        );
        showSnackbar("Email permanently deleted");
        return;
      }

      // Inbox / Sent / Spam → Trash
      await deleteEmail(email.id, folder);
      setEmails((prevEmails) =>
        prevEmails.map((item) => {
          if (item.id !== email.id) {
            return item;
          }
          // Inbox → Trash
          if (folder === "inbox") {
            return {
              ...item,
              receiverFolder: "trash",
            };
          }
          // Spam → Trash
          if (folder === "spam") {
            // Received Spam
            if (item.receiverFolder === "spam") {
              return {
                ...item,
                receiverFolder: "trash",
              };
            }
            // Sent Spam
            if (item.senderFolder === "spam") {
              return {
                ...item,
                senderFolder: "trash",
              };
            }
          }
          // Sent → Trash
          if (folder === "sent") {
            return {
              ...item,
              senderFolder: "trash",
            };
          }
          if (folder === "archive") {
            if (item.receiverFolder === "archive") {
              return {
                ...item,
                receiverFolder: "trash",
              };
            }
            if (item.senderFolder === "archive") {
              return {
                ...item,
                senderFolder: "trash",
              };
            }
          }
          return item;
        })
      );

      // Remove from selected
      setSelectedEmails((prev) =>
        prev.filter((id) => id !== email.id)
      );

      // Undo
      showSnackbar("Email moved to Trash", async () => {
        try {
          const restoredEmail = await restoreEmail(
            email.id,
            folder
          );

          setEmails((prevEmails) =>
            prevEmails.map((item) =>
              item.id === email.id
                ? restoredEmail
                : item
            )
          );
        } catch (error) {
          console.error(
            "Unable to undo delete",
            error
          );
        }
      });

    } catch (error) {
      console.error(
        "Unable to delete email",
        error
      );
    }
  };

  const isArchived =
    (email.from === loggedInUser?.email && email.senderFolder === "archive") ||
    (email.from !== loggedInUser?.email && email.receiverFolder === "archive");

  const isDraftInTrash =
    folder === "trash" &&
    email?.senderFolder === "draft" &&
    email?.from === loggedInUser?.email;

  const handleOpenEmail = () => {
    if (isDraftInTrash) {
      setDraftToEdit(email);
      return;
    }

    openSelectedMail(email.id, folder);
  };

  const handleArchive = async (event) => {
    event.stopPropagation();
    try {
      const originalFolder = folder;
      // Archive only supported folders
      if (originalFolder !== "inbox" &&
        originalFolder !== "spam" &&
        originalFolder !== "sent" &&
        originalFolder !== "starred-received" &&
        originalFolder !== "starred-sent"
      ) {
        console.error(`Cannot archive email from folder: ${originalFolder}`);
        return;
      }

      const archivedEmail = await archiveEmail(
        email.id,
        originalFolder
      );

      // Update local state
      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? archivedEmail
            : item
        )
      );

      // Remove from selected emails
      setSelectedEmails((prev) =>
        prev.filter((id) => id !== email.id)
      );

      // Snackbar + Undo
      showSnackbar(
        "Conversation archived",
        async () => {
          try {
            const restoredEmail = await restoreArchivedEmail(
              email.id,
              originalFolder
            );

            setEmails((prevEmails) =>
              prevEmails.map((item) =>
                item.id === email.id
                  ? restoredEmail
                  : item
              )
            );
          } catch (error) {
            console.error(
              "Unable to undo archive",
              error
            );
          }
        }
      );

    } catch (error) {
      console.error(
        "Unable to archive email",
        error
      );
    }
  };

const handleUnarchive = async (event) => {
  event.stopPropagation();

  try {
    const restoreFolder =
      email.from === loggedInUser?.email
        ? "sent"
        : "inbox";

    const restoredEmail = await restoreArchivedEmail(
      email.id,
      restoreFolder
    );

    setEmails((prevEmails) =>
      prevEmails.map((item) =>
        item.id === email.id
          ? restoredEmail
          : item
      )
    );

    setSelectedEmails((prev) =>
      prev.filter((id) => id !== email.id)
    );

    showSnackbar(
      `Email moved to ${
        restoreFolder === "sent" ? "Sent" : "Inbox"
      }`
    );
  } catch (error) {
    console.error(
      "Unable to unarchive email:",
      error
    );
  }
};

  const handleSnooze = (event) => {
    event.stopPropagation();
    setSnoozeOpen(true);
  };
  const handleConfirmSnooze = async (snoozedUntil) => {
    try {
      // Snooze API
      const snoozedEmail = await snoozeEmail(
        email.id,
        folder,
        snoozedUntil
      );

      // Update email in local state
      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? snoozedEmail
            : item
        )
      );

      // Remove from selected emails
      setSelectedEmails((prev) =>
        prev.filter((id) => id !== email.id)
      );

      // Close dialog
      setSnoozeOpen(false);
      // UNDO SNOOZE
      showSnackbar(
        "Email snoozed",
        async () => {
          try {
            console.log("Undo Snooze clicked");
            console.log("Email ID:", email.id);
            console.log("Folder:", folder);

            const unsnoozedEmail = await unsnoozeEmail(email.id, folder);
            console.log("Unsnoozed email:", unsnoozedEmail);
            // Update state with API response
            setEmails((prevEmails) =>
              prevEmails.map((item) =>
                item.id === email.id
                  ? unsnoozedEmail
                  : item
              )
            );
          } catch (error) {
            console.error(
              "Unable to undo snooze:",
              error
            );
          }
        }
      );
    } catch (error) {
      console.error(
        "Unable to snooze email:",
        error
      );
    }
  };
  const handleMarkAsRead = async (event) => {
    event.stopPropagation();

    try {
      await updateEmail(email.id, {
        ...email,
        read: true,
      });

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? { ...item, read: true }
            : item
        )
      );

      showSnackbar("Marked as read");
    } catch (error) {
      console.error("Unable to mark as read:", error);
    }
  };
  const handleMarkAsUnread = async (event) => {
    event.stopPropagation();

    try {
      await updateEmail(email.id, {
        ...email,
        read: false,
      });

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? { ...item, read: false }
            : item
        )
      );

      showSnackbar("Marked as unread");
    } catch (error) {
      console.error("Unable to mark as unread:", error);
    }
  };
  
  const snoozedUntil =
    folder === "archive"
      ? (email.receiverFolder === "archive"
          ? email.receiverSnoozedUntil
          : email.senderSnoozedUntil)
      : folder === "inbox" || folder === "spam"
        ? email.receiverSnoozedUntil
        : email.senderSnoozedUntil;

  const isSnoozed = Boolean(snoozedUntil) && new Date(snoozedUntil) > new Date();
  const canArchive = folder === "inbox" || folder === "spam" || folder === "sent" ||
    folder === "starred-received" || folder === "starred-sent";
  const displaySender = getSenderDisplayLabel(email, loggedInUser.email);
  const displayReceiver = getReceiverDisplayLabel(email, loggedInUser.email);
  const formattedDate = formatMailDate(email.createdAt || email.date);
  const senderLabel = isDraftInTrash
    ? "Draft"
    : (folder === "sent" || (folder === "archive" && email.from === loggedInUser?.email)
      ? displayReceiver
      : displaySender);

  return (
    <>
      <div
        className={`email-row ${isSelected ? "email-selected" : ""}`}
        onClick={handleOpenEmail} >
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onClick={(event) => event.stopPropagation()}
          onChange={handleCheckboxChange} />

        {/* Star */}
        {folder !== "trash" && (
          <IconButton onClick={handleStar}>
            {email.starred ? (
              <StarIcon className="star-active" />
            ) : (
              <StarBorderIcon />
            )}
          </IconButton>
        )}

{/* Sender */}
<div className={`email-sender ${!email.read && !isDraftInTrash ? "unread" : ""} ${isDraftInTrash ? "text" : ""}`}>
  {senderLabel}
</div>
        {/* Subject + Message */}
        <div className={`email-content ${!email.read ? "unread" : ""}`}>
          <span className="email-subject">{email.subject}</span>

          <span className="email-preview">{" - " + email.message}</span>
        </div>
        {/* Date / Snoozed time */}
        <div className="email-date">
          {isSnoozed
            ? `Snoozed until ${new Date(snoozedUntil).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}`
            : formattedDate}
        </div>
        {/* Hover Actions */}
        <div
          className={`email-hover-actions ${isSelected ? "show-actions" : ""}`}
          onClick={(event) => event.stopPropagation()} >
          {isArchived ? (
            <IconButton title="Unarchive" onClick={handleUnarchive}>
              <ArchiveIcon />
            </IconButton>
          ) : canArchive && (
            <IconButton title="Archive" onClick={handleArchive}>
              <ArchiveIcon />
            </IconButton>
          )}

          <IconButton title="Snooze" onClick={handleSnooze}>
            <SnoozeIcon />
          </IconButton>

          <IconButton
            title={email.read ? "Mark as unread" : "Mark as read"}
            onClick={email.read ? handleMarkAsUnread : handleMarkAsRead}
          >
            {email.read ? (
              <MarkEmailUnreadIcon />
            ) : (
              <MarkEmailReadIcon />
            )}
          </IconButton>

          <IconButton title="Delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </div>
      </div>
      <SnoozeDialog
        open={snoozeOpen}
        onClose={() => setSnoozeOpen(false)}
        onSnooze={handleConfirmSnooze} />
    </>
  );
};
export default EmailRow;
