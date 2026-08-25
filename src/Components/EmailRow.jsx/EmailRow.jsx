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
import { deleteEmail, toggleStarEmail, permanentlyDeleteEmail, archiveEmail, snoozeEmail } from "../../authApi/emailsApi";
import "./EmailRow.css";
import SnoozeDialog from "../SnoozeDialoge/SnoozeDialog";
const EmailRow = ({ email, folder }) => {

    const { loggedInUser } = useContext(UserContext);
    const { emails, setEmails, openSelectedMail, selectedEmails, setSelectedEmails, setUndoEmail
    } = useOutletContext();

    // Check whether this email is selected
    const isSelected = selectedEmails.includes(email.id);
    const [snoozeOpen, setSnoozeOpen] = useState(false);
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

    // Star
    const handleStar = async (event) => {
        event.stopPropagation();

        const newStarredValue = !email.starred;
        try {
            await toggleStarEmail(
                email.id,
                newStarredValue
            );

            setEmails((prevEmails) =>
                prevEmails.map((item) =>
                    item.id === email.id
                        ? {
                            ...item,
                            starred: newStarredValue
                        }
                        : item
                )
            );

        } catch (error) {
            console.error(
                "Unable to update star",
                error
            );
        }
    };

    // Delete
    const handleDelete = async (event) => {
        event.stopPropagation();

        try {

            // Trash → permanently delete
            if (folder === "trash") {

                const deleteFolder =
                    email.from === loggedInUser.email
                        ? "sent"
                        : "inbox";

                await permanentlyDeleteEmail(
                    email.id,
                    deleteFolder
                );

                setEmails((prevEmails) =>
                    prevEmails.filter(
                        (item) => item.id !== email.id
                    )
                );

            } else {
                // Existing Inbox / Sent flow
                await deleteEmail(email.id,
                    folder
                );
                setEmails((prevEmails) =>
                    prevEmails.map((item) =>
                        item.id === email.id
                            ? folder === "inbox"
                                ? {
                                    ...item,
                                    receiverFolder: "trash"
                                }
                                : folder === "sent"
                                    ? {
                                        ...item,
                                        senderFolder: "trash"
                                    }
                                    : item
                            : item
                    )
                );
                // Remove from selected emails
                setSelectedEmails((prev) =>
                    prev.filter(
                        (id) => id !== email.id)
                );
                // Save for Undo
                setUndoEmail({ id: email.id, folder: folder });
            }
        } catch (error) {
            console.error("Unable to delete email", error);
        }
    };

    // These are only UI for now
    const handleArchive = async (event) => {
        event.stopPropagation();

        try {
            await archiveEmail(email.id, folder);

            setEmails((prevEmails) =>
                prevEmails.map((item) => {
                    if (item.id !== email.id) {
                        return item;
                    }

                    if (folder === "inbox" || folder === "spam") {
                        return {
                            ...item,
                            receiverFolder: "archive",
                        };
                    }

                    if (folder === "sent") {
                        return {
                            ...item,
                            senderFolder: "archive",
                        };
                    }

                    return item;
                })
            );

            setSelectedEmails((prev) =>
                prev.filter((id) => id !== email.id)
            );

        } catch (error) {
            console.error("Unable to archive email", error);
        }
    };

    const handleSnooze = (event) => {
        event.stopPropagation();
        setSnoozeOpen(true);
    }
    const handleConfirmSnooze = async (snoozedUntil) => {
        try {
            await snoozeEmail(
                email.id,
                folder,
                snoozedUntil);
            setEmails((prevEmails) =>
                prevEmails.map((item) => {
                    if (item.id !== email.id) {
                        return item;
                    }
                    // Received email
                    if (folder === "inbox" ||
                        folder === "spam" ||
                        folder === "starred-received") {
                        return {
                            ...item,
                            receiverSnoozedUntil:
                                snoozedUntil
                        };
                    }
                    // Sent email
                    if (
                        folder === "sent" ||
                        folder === "starred-sent"
                    ) {
                        return {
                            ...item,
                            senderSnoozedUntil:
                                snoozedUntil
                        };
                    }
                    return item;
                })
            );
            // Remove from selected emails
            setSelectedEmails((prev) =>
                prev.filter(
                    (id) => id !== email.id)
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

    return (
        <div
            className={`email-row ${isSelected ? "email-selected" : ""}`}
            onClick={() =>
                openSelectedMail(
                    email.id,
                    folder
                )
            }
        >

            {/* Checkbox */}
            <Checkbox
                checked={isSelected}
                onClick={(event) =>
                    event.stopPropagation()
                }
                onChange={handleCheckboxChange}
            />

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
                {folder === "sent"
                    ? email.to
                    : email.from}
            </div>

            {/* Subject + Message */}
            <div className="email-content">
                <span className="email-subject">
                    {email.subject}
                </span>

                <span className="email-preview">
                    {" - " + email.message}
                </span>
            </div>

            {/* Date */}
            <div className="email-date">
                {email.date || "Today"}
            </div>

            {/* Hover Actions */}
            <div
                className={`email-hover-actions ${isSelected ? "show-actions" : ""
                    }`}
                onClick={(event) =>
                    event.stopPropagation()
                }
            >

                <IconButton
                    title="Archive"
                    onClick={handleArchive}
                >
                    <ArchiveIcon />
                </IconButton>

                <IconButton
                    title="Snooze"
                    onClick={handleSnooze}
                >
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
                    onClick={handleDelete}
                >
                    <DeleteIcon />
                </IconButton>

            </div>

            {/* Snooze Dialog */}
            <SnoozeDialog
                open={snoozeOpen}
                onClose={() => setSnoozeOpen(false)}
                onSnooze={handleConfirmSnooze}
            />

        </div>
    );
};

export default EmailRow;