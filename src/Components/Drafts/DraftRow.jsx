import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SnoozeIcon from "@mui/icons-material/Snooze";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { deleteEmail, permanentlyDeleteEmail, snoozeEmail } from "../../authApi/emailsApi";
import { unsnoozeEmail } from "../../authApi/UnSnoozeEmail";
import { updateEmail } from "../../authApi/updateEmail";
import { formatMailDate } from "../../Utils/mailUtils";
import SnoozeDialog from "../SnoozeDialoge/SnoozeDialog";
import "./DraftRow.css";

const DraftRow = ({ email, folder = "draft" }) => {
    const {
        setEmails,
        selectedEmails,
        setSelectedEmails,
        setDraftToEdit,
        showSnackbar,
    } = useOutletContext();
    const [snoozeOpen, setSnoozeOpen] = useState(false);
    const isSelected = selectedEmails.includes(email.id);
    const isInTrash = folder === "trash";

    const handleCheckboxChange = (event) => {
        event.stopPropagation();
        setSelectedEmails((prev) =>
            event.target.checked
                ? [...prev, email.id]
                : prev.filter((id) => id !== email.id)
        );
    };

    const handleDelete = async (event) => {
        event.stopPropagation();
        const originalEmail = { ...email };
        try {
            if (isInTrash) {
                await permanentlyDeleteEmail(email.id);
                setEmails((prev) => prev.filter((item) => item.id !== email.id));
                setSelectedEmails((prev) => prev.filter((id) => id !== email.id));
                showSnackbar("Draft permanently deleted");
                return;
            }

            const deletedEmail = await deleteEmail(email.id, "draft");
            setEmails((prev) => prev.map((item) =>
                item.id === email.id ? deletedEmail : item
            ));
            setSelectedEmails((prev) => prev.filter((id) => id !== email.id));
            showSnackbar("Draft moved to Trash", async () => {
                const restoredEmail = await updateEmail(originalEmail.id, originalEmail);
                setEmails((prev) => prev.map((item) =>
                    item.id === restoredEmail.id ? restoredEmail : item
                ));
            });
        } catch (error) {
            console.error("Unable to delete draft", error);
        }
    };

    const handleSnooze = (event) => {
        event.stopPropagation();
        setSnoozeOpen(true);
    };

    const handleConfirmSnooze = async (snoozedUntil) => {
        try {
            const snoozedEmail = await snoozeEmail(email.id, folder, snoozedUntil);
            setEmails((prev) => prev.map((item) =>
                item.id === email.id ? snoozedEmail : item
            ));
            setSelectedEmails((prev) => prev.filter((id) => id !== email.id));
            setSnoozeOpen(false);
            showSnackbar("Email snoozed", async () => {
                const restoredEmail = await unsnoozeEmail(email.id, folder);
                setEmails((prev) => prev.map((item) =>
                    item.id === restoredEmail.id ? restoredEmail : item
                ));
            });
        } catch (error) {
            console.error("Unable to snooze draft", error);
        }
    };

    const handleMarkRead = async (event) => {
        event.stopPropagation();
        try {
            const updatedEmail = await updateEmail(email.id, {
                ...email,
                read: !email.read,
            });
            setEmails((prev) => prev.map((item) =>
                item.id === updatedEmail.id ? updatedEmail : item
            ));
            showSnackbar(email.read ? "Marked as unread" : "Marked as read");
        } catch (error) {
            console.error("Unable to update draft read state", error);
        }
    };

    return (
        <>
            <div
                className={`email-row ${isSelected ? "email-selected" : ""}`}
                onClick={() => setDraftToEdit(email)}
            >
                <Checkbox
                    checked={isSelected}
                    onClick={(event) => event.stopPropagation()}
                    onChange={handleCheckboxChange}
                />
                <div className="email-sender text">Draft</div>
                <div className="email-content">
                    <span className="email-subject">{email.subject || "(no subject)"}</span>
                    <span className="email-preview">{" - " + (email.message || "")}</span>
                </div>
                <div className="email-date">
                    {formatMailDate(email.createdAt || email.date)}
                </div>
                <div
                    className={`email-hover-actions ${isSelected ? "show-actions" : ""}`}
                    onClick={(event) => event.stopPropagation()}
                >
                    <IconButton title="Snooze" onClick={handleSnooze}>
                        <SnoozeIcon />
                    </IconButton>
                    <IconButton
                        title={email.read ? "Mark as unread" : "Mark as read"}
                        onClick={handleMarkRead}
                    >
                        {email.read ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />}
                    </IconButton>
                    <IconButton title="Delete" onClick={handleDelete}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            </div>
            <SnoozeDialog
                open={snoozeOpen}
                onClose={() => setSnoozeOpen(false)}
                onSnooze={handleConfirmSnooze}
            />
        </>
    );
};

export default DraftRow;
