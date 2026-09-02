
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const EmailChangeDialog = ({ open,onClose,onCancel, onContinue, attemptsLeft,}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableRestoreFocus >
            <DialogTitle>
                Change your D-mail?
            </DialogTitle>

            <DialogContent>
                <p>
                    You have{" "}
                    <strong>{attemptsLeft}</strong>{" "}
                        D-mail change{" "}
                    {attemptsLeft === 1
                        ? "attempt"
                        : "attempts"}{" "}
                    remaining.
                </p>
                <p> Your previous D-mail address will remain
                    connected to this D-mail account.
                </p>

                <p> Dmails sent to your old and new email
                    addresses will continue to reach the same
                    account.
                </p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel || onClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onContinue || onClose}>
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default EmailChangeDialog;
