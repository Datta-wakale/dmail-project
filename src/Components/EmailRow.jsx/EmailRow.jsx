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
import { deleteEmail, toggleStarEmail, permanentlyDeleteEmail, archiveEmail, snoozeEmail, } from "../../authApi/emailsApi";
import { restoreArchivedEmail } from "../../authApi/restoreEmail";
import "./EmailRow.css";
import { restoreEmail } from "../../authApi/emailsApi";
import SnoozeDialog from "../SnoozeDialoge/SnoozeDialog";
const EmailRow = ({ email, folder }) => {
  const { loggedInUser } = useContext(UserContext);
  const {
    emails,
    setEmails,
    openSelectedMail,
    selectedEmails,
    setSelectedEmails,
    setUndoEmail, showSnackbar
  } = useOutletContext();

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

  // Delete
  // const handleDelete = async (event) => {
  //   event.stopPropagation();

  //   try {
  //     // Trash → permanently delete
  //     if (folder === "trash") {
  //       const deleteFolder =
  //         email.from === loggedInUser.email ? "sent" : "inbox";

  //       await permanentlyDeleteEmail(email.id, deleteFolder);

  //       setEmails((prevEmails) =>
  //         prevEmails.filter((item) => item.id !== email.id)
  //       );

  //       showSnackbar("Email permanently deleted");

  //       return;
  //     }

  //     // Inbox / Sent → Trash
  //     await deleteEmail(email.id, folder);

  //     setEmails((prevEmails) =>
  //       prevEmails.map((item) =>
  //         item.id === email.id
  //           ? folder === "inbox" || folder === "spam"
  //             ? {
  //               ...item,
  //               receiverFolder: "trash",
  //             }
  //             : folder === "sent"
  //               ? {
  //                 ...item,
  //                 senderFolder: "trash",
  //               }
  //               : item
  //           : item
  //       )
  //     );

  //     // Remove from selected
  //     setSelectedEmails((prev) =>
  //       prev.filter((id) => id !== email.id)
  //     );

  //     // Show snackbar
  //     showSnackbar("Email moved to Trash", async () => {
  //       try {
  //         const restoredEmail = await restoreEmail(email.id, folder);

  //         setEmails((prevEmails) =>
  //           prevEmails.map((item) =>
  //             item.id === email.id
  //               ? restoredEmail
  //               : item
  //           )
  //         );

  //         setSelectedEmails((prev) =>
  //           prev.filter((id) => id !== email.id)
  //         );
  //       } catch (error) {
  //         console.error("Unable to undo delete", error);
  //       }
  //     });

  //   } catch (error) {
  //     console.error("Unable to delete email", error);
  //   }
  // };
  const handleDelete = async (event) => {
  event.stopPropagation();

  try {
    // Trash → permanently delete
    if (folder === "trash") {
      await permanentlyDeleteEmail(email.id);

      // Remove completely from React state
      setEmails((prevEmails) =>
        prevEmails.filter((item) => item.id !== email.id)
      );

      // Remove from selected emails
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

        // Received email
        if (folder === "inbox" || folder === "spam") {
          return {
            ...item,
            receiverFolder: "trash",
          };
        }

        // Sent email
        if (folder === "sent") {
          return {
            ...item,
            senderFolder: "trash",
          };
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
  // These are only UI for now
  // const handleArchive = async (event) => {
  //   event.stopPropagation();

  //   try {
  //     // Save the original folder for Undo
  //     const originalFolder = folder;

  //     // Move email to archive in API
  //     const archivedEmail = await archiveEmail(
  //       email.id,
  //       originalFolder
  //     );

  //     // Update local state
  //     setEmails((prevEmails) =>
  //       prevEmails.map((item) =>
  //         item.id === email.id
  //           ? archivedEmail
  //           : item
  //       )
  //     );

  //     // Remove from selected emails
  //     setSelectedEmails((prev) =>
  //       prev.filter((id) => id !== email.id)
  //     );

  //     // Snackbar + Undo
  //     showSnackbar(
  //       "Conversation archived",
  //       async () => {
  //         try {
  //           const restoredEmail = await restoreArchivedEmail(
  //             email.id,
  //             originalFolder
  //           );

  //           setEmails((prevEmails) =>
  //             prevEmails.map((item) =>
  //               item.id === email.id
  //                 ? restoredEmail
  //                 : item
  //             )
  //           );
  //         } catch (error) {
  //           console.error(
  //             "Unable to undo archive",
  //             error
  //           );
  //         }
  //       }
  //     );

  //   } catch (error) {
  //     console.error(
  //       "Unable to archive email",
  //       error
  //     );
  //   }
  // };

  const handleArchive = async (event) => {
    event.stopPropagation();

    try {
      const originalFolder = folder;

      // Archive only supported folders
      if (
        originalFolder !== "inbox" &&
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
  const handleSnooze = (event) => {
    event.stopPropagation();
    setSnoozeOpen(true);
  };
  const handleConfirmSnooze = async (snoozedUntil) => {
    try {
      await snoozeEmail(email.id, folder, snoozedUntil);

      setEmails((prevEmails) =>
        prevEmails.map((item) => {
          if (item.id !== email.id) {
            return item;
          }
          // Received emails
          if (folder === "inbox" || folder === "spam") {
            return {
              ...item,
              receiverSnoozedUntil: snoozedUntil,
            };
          }
          // Sent / Draft emails
          if (folder === "sent" || folder === "draft") {
            return {
              ...item,
              senderSnoozedUntil: snoozedUntil,
            };
          }
          return item;
        }),
      );

      setSelectedEmails((prev) =>
        prev.filter((id) => id !== email.id)
      );

      setSnoozeOpen(false);
    } catch (error) {
      console.error("Unable to snooze email", error);
    }
  };
  const handleMarkAsRead = (event) => {
    event.stopPropagation();
    console.log("Mark as read:", email.id);
  };
  const isSnoozed =
    ((folder === "inbox" || folder === "spam") && email.receiverSnoozedUntil &&
      new Date(email.receiverSnoozedUntil) > new Date()) || ((folder === "sent" || folder === "draft")
        && email.senderSnoozedUntil && new Date(email.senderSnoozedUntil) > new Date());
  const canArchive = folder === "inbox" || folder === "spam" || folder === "sent" ||
    folder === "starred-received" || folder === "starred-sent";
  return (
    <>
      <div
        className={`email-row ${isSelected ? "email-selected" : ""}`}
        onClick={() => openSelectedMail(email.id, folder)}
      >
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onClick={(event) => event.stopPropagation()}
          onChange={handleCheckboxChange} />

        {/* Star */}
        <IconButton onClick={handleStar}>
          {email.starred ? (
            <StarIcon className="star-active" />
          ) : (
            <StarBorderIcon />
          )}
        </IconButton>

        {/* Sender */}
        <div className="email-sender">
          {folder === "sent" ? email.to : email.from}
        </div>
        {/* Subject + Message */}
        <div className="email-content">
          <span className="email-subject">{email.subject}</span>

          <span className="email-preview">{" - " + email.message}</span>
        </div>
        {/* Date / Snoozed time */}
        <div className="email-date">
          {isSnoozed
            ? `Snoozed until ${new Date(
              folder === "inbox" || folder === "spam"
                ? email.receiverSnoozedUntil
                : email.senderSnoozedUntil,
            ).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}`
            : email.date || "Today"}
        </div>
        {/* Hover Actions */}
        <div
          className={`email-hover-actions ${isSelected ? "show-actions" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
          {canArchive && (
            <IconButton title="Archive" onClick={handleArchive}>
              <ArchiveIcon />
            </IconButton>
          )}

          <IconButton title="Snooze" onClick={handleSnooze}>
            <SnoozeIcon />
          </IconButton>

          <IconButton title="Mark as read" onClick={handleMarkAsRead}>
            <MarkEmailReadIcon />
          </IconButton>

          <IconButton title="Delete" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      {/* IMPORTANT: outside email-row */}
      <SnoozeDialog
        open={snoozeOpen}
        onClose={() => setSnoozeOpen(false)}
        onSnooze={handleConfirmSnooze} />
    </>
  );
};
export default EmailRow;
