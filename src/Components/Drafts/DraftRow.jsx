import { useOutletContext } from "react-router-dom";

import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";

import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import SnoozeIcon from "@mui/icons-material/Snooze";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { deleteEmail } from "../../authApi/emailsApi";
import { restoreEmail } from "../../authApi/restoreEmail";
import "./DraftRow.css";
const DraftRow = ({ email }) => {

    const {
        emails,
        setEmails,
        selectedEmails,
        setSelectedEmails,
        setDraftToEdit,showSnackbar
    } = useOutletContext();

    // Check selected
    const isSelected = selectedEmails.includes(email.id);

    // Checkbox
    const handleCheckboxChange = (event) => {

        event.stopPropagation();

        const checked = event.target.checked;

        if (checked) {

            setSelectedEmails((prev) => [
                ...prev,
                email.id
            ]);

        } else {

            setSelectedEmails((prev) =>
                prev.filter(
                    (id) => id !== email.id
                )
            );

        }
    };

    // Open draft
    const handleOpenDraft = () => {
        setDraftToEdit(email);
    };

    // Delete draft permanently
   const handleDelete = async (event) => {
  event.stopPropagation();

  try {
    await deleteEmail(email.id, "draft");

    setEmails((prevEmails) =>
      prevEmails.map((item) =>
        item.id === email.id
          ? {
              ...item,
              senderFolder: "trash",
            }
          : item
      )
    );

    setSelectedEmails((prev) =>
      prev.filter((id) => id !== email.id)
    );
    showSnackbar("Draft moved to Trash", async () => {
      try {
        const restoredEmail = await restoreEmail(
          email.id,
          "draft"
        );
        setEmails((prevEmails) =>
          prevEmails.map((item) =>
            item.id === email.id
              ? restoredEmail
              : item
          )
        );
      } catch (error) {
        console.error("Unable to undo draft delete", error);
      }
    });
  } catch (error) {
    console.error("Unable to delete draft", error);
  }
};
    // UI only for now
    const handleArchive = (event) => {
        event.stopPropagation();
        console.log(
            "Archive draft:",
            email.id);
    };

    const handleSnooze = (event) => {
        event.stopPropagation();
        console.log("Snooze draft:", email.id);
    };

    const handleMarkAsRead = (event) => {
        event.stopPropagation();
        console.log("mark as read:", email.id);
    }

    return (

        <div className={`email-row ${isSelected
                ? "email-selected"
                : ""
            }`}
            onClick={handleOpenDraft} >
            {/* Checkbox */}

            <Checkbox
                checked={isSelected}
                onClick={(event) =>
                    event.stopPropagation()
                }
                onChange={handleCheckboxChange} />
            <div className="email-sender text">  Draft </div>
            <div className="email-content">
                <span className="email-subject">
                    {email.subject ||
                        "(no subject)"}
                </span>
                <span className="email-preview">
                    {" - " +
                        (email.message || "")}

                </span>
            </div>
            <div className="email-date">
                {email.date || "Today"}
            </div>

            {/* Hover Actions */}

            <div
                className={`email-hover-actions ${isSelected
                        ? "show-actions"
                        : ""
                    }`}
                onClick={(event) =>
                    event.stopPropagation()
                } >

                <IconButton
                    title="Archive"
                    onClick={handleArchive} >
                    <ArchiveIcon />
                </IconButton>
                <IconButton
                    title="Snooze"
                    onClick={handleSnooze} >
                    <SnoozeIcon />
                </IconButton>

                <IconButton
                    title="Mark as read"
                    onClick={handleMarkAsRead}
                >
                    <MarkEmailReadIcon />
                </IconButton>

                <IconButton
                    title="Delete"
                    onClick={handleDelete} >
                    <DeleteIcon />
                </IconButton>
            </div>
        </div>

    );
};

export default DraftRow;