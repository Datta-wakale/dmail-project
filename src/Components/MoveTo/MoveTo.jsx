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

const MoveToMenu = ({ email, trashType, onMove }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const handleOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMove = async (toFolder) => {
        try {
            const fromFolder =
                trashType === "sender"
                    ? "sender"
                    : "receiver";

            await moveEmail(
                email.id,
                fromFolder,
                toFolder
            );

            toast.success(
                `Moved to ${toFolder}`
            );

            handleClose();

            if (onMove) {
                onMove(email.id);
            }

        } catch (error) {
            console.error("Unable to move email", error);

            toast.error("Unable to move email");

            handleClose();
        }
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                title="Move to"
                size="small"
            >
                <MoveToInboxIcon fontSize="small" />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem
                    onClick={() => handleMove("inbox")}
                >
                    <InboxIcon
                        fontSize="small"
                        style={{ marginRight: 10 }} />

                    Move to Inbox
                </MenuItem>

                {trashType === "sender" && (
                    <MenuItem
                        onClick={() => handleMove("sent")}
                    >
                        <SendIcon
                            fontSize="small"
                            style={{ marginRight: 10 }}
                        />

                        Move to Sent
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

export default MoveToMenu;