
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const EmailChangeDialog = ({
    open,
    onClose,
    onCancel,
    onContinue,
    attemptsLeft,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth>
            <DialogTitle>
                Change your email?
            </DialogTitle>

            <DialogContent>
                <p>
                    You have{" "}
                    <strong>{attemptsLeft}</strong>{" "}
                    email change{" "}
                    {attemptsLeft === 1
                        ? "attempt"
                        : "attempts"}{" "}
                    remaining.
                </p>

                <p>
                    Your previous email address will remain
                    connected to this D-mail account.
                </p>

                <p>
                    Emails sent to your old and new email
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
