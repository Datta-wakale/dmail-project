
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";
import { moveEmail } from "../../authApi/moveEmail";

import "./MoveTo.css";

const MoveToMenu = ({
    email,
    emails = [],
    selectedEmails = [],
    loggedInUser,
    folder,
    trashType,
    onMove,
}) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const getEmailTrashType = (mail) => {

        if (!mail) {
            return null;
        }

        // Received email which was moved from Inbox to Trash
        if (
            mail.to === loggedInUser?.email &&
            mail.receiverFolder === "trash"
        ) {
            return "receiver";
        }

        // Sent email which was moved from Sent to Trash
        if ( mail.from === loggedInUser?.email && mail.senderFolder === "trash" ) {
            return "sender";
        }

        return null;
    };

    const handleSingleMove = async (toFolder) => {

        if (!email) {
            return;
        }
        try {
            let fromFolder = folder;
            if (folder === "trash") {
                const type =
                    trashType || getEmailTrashType(email);
                if (!type) {
                    toast.error("Unable to determine email folder");
                    handleClose();
                    return;
                }

                if ( type === "receiver" &&
                    toFolder !== "inbox") {
                    toast.error(
                        "This email can only be moved to Inbox");
                    handleClose();
                    return;
                }

                if ( type === "sender" &&  toFolder !== "sent") {
                    toast.error(  "This email can only be moved to Sent" );
                    handleClose();
                    return;
                }
                fromFolder = type;
            }
            // moveEmail returns the updated email
            const updatedEmail = await moveEmail(email.id,fromFolder, toFolder);
            toast.success(`Moved to ${toFolder}`);
            handleClose();
            // Send updated email back to parent
            if (onMove) {
                await onMove( updatedEmail, toFolder );}
        } catch (error) {
            console.error("Unable to move email", error);
            toast.error("Unable to move email" );
            handleClose();
        }
    };

    const handleMultipleMove = async (toFolder) => {
        if (selectedEmails.length === 0) {
            return;
        }
        try {
            const selectedMailObjects = selectedEmails
                .map((id) =>
                    emails.find(
                        (item) =>
                            String(item.id) === String(id)
                    )
                )
                .filter(Boolean);
            if (folder === "trash") {
                const classifiedEmails =
                    selectedMailObjects.map((mail) => ({
                        mail,
                        type: getEmailTrashType(mail),
                    }));

                const hasInvalidEmail = classifiedEmails.some(
                        ({ type }) => !type
                    );
                if (hasInvalidEmail) {
                    toast.error(
                        "Unable to determine email type"
                    );
                    handleClose();
                    return;
                }

                const allReceived =
                    classifiedEmails.every(
                        ({ type }) =>
                            type === "receiver"
                    );

                const allSent =
                    classifiedEmails.every(
                        ({ type }) =>
                            type === "sender"
                    );

                // emails to be moved together.
                if (!allReceived && !allSent) {
                    toast.error(  "Please select only received emails or only sent emails"  );
                    handleClose();
                    return;
                }
                // Received emails → Inbox only
                if ( allReceived && toFolder !== "inbox" ) {
                    toast.error( "These emails can only be moved to Inbox" );
                    handleClose();
                    return;
                }
                // Sent emails → Sent only
                if ( allSent && toFolder !== "sent") {
                    toast.error(  "These emails can only be moved to Sent");
                    handleClose();
                    return;
                }

                const updatedEmails = await Promise.all(
                    classifiedEmails.map(
                        ({ mail, type }) =>
                            moveEmail(
                                mail.id,
                                type,
                                toFolder
                            )
                    )
                );
                toast.success( `${selectedEmails.length} emails moved to ${toFolder}` );
                handleClose();
                // Send updated email objects to parent
                if (onMove) {
                    await onMove(updatedEmails, toFolder );
                }
                return;
            }
            const updatedEmails = await Promise.all(
                selectedEmails.map((id) =>
                    moveEmail(id,folder, toFolder)
                )
            );
            toast.success( `${selectedEmails.length} emails moved to ${toFolder}` );
            handleClose();
            // Send updated email objects to parent
            if (onMove) {
                await onMove( updatedEmails,toFolder );
            }
        } catch (error) {
            console.error("Unable to move emails", error);
            toast.error( "Unable to move emails");
            handleClose();
        }
    };
    let showInbox = false;
    let showSent = false;

    if ( email && selectedEmails.length === 0) {
        if (folder === "trash") {
            const type = trashType ||
                getEmailTrashType(email);
            if (type === "receiver") {
                showInbox = true;
            }
            if (type === "sender") {
                showSent = true;
            }
        } else {
            if (folder === "inbox") {
                showInbox = true;
            }
            if (folder === "sent") {
                showSent = true;
            }
        }
    }

    if (selectedEmails.length > 0 && emails.length > 0) {

        const selectedMailObjects = selectedEmails
            .map((id) =>
                emails.find(
                    (item) =>
                        String(item.id) === String(id))
            )
            .filter(Boolean);
        if (folder === "trash") {
            const types =selectedMailObjects.map(getEmailTrashType);

            const allReceived =  types.length > 0 &&
                types.every( (type) =>  type === "receiver");

            const allSent = types.length > 0 &&
                types.every((type) => type === "sender" );

            // Only show one option
            if (allReceived) {
                showInbox = true;
            }
            if (allSent) {
                showSent = true;
            }

        } else {
            if (folder === "inbox") {
                showInbox = true;
            }
            if (folder === "sent") {
                showSent = true;
            }
        }
    }
    if (!showInbox && !showSent) {
        return null;
    }

    
  
    return (
        <>
            <IconButton
                onClick={handleOpen}
                title="Move to"
                size="small">
                <MoveToInboxIcon fontSize="small" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose} >

                {showInbox && (
                    <MenuItem
                        onClick={() => {
                            if (selectedEmails.length > 0 ) {
                                handleMultipleMove("inbox");
                            } else {
                                handleSingleMove(
                                    "inbox"
                                );
                            }
                        }} >
                        <InboxIcon
                            fontSize="small"
                            style={{
                                marginRight: 10,
                            }} />

                        Move to Inbox
                    </MenuItem>
                )}

                {showSent && (
                    <MenuItem
                        onClick={() => {
                            if ( selectedEmails.length > 0) {
                                handleMultipleMove( "sent" );
                            } else {
                                handleSingleMove( "sent");
                            }
                        }}>
                        <SendIcon  fontSize="small"
                            style={{ marginRight: 10, }}/>
                        Move to Sent
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};
export default MoveToMenu;

