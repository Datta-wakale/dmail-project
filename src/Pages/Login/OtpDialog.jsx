import {Dialog, DialogTitle,DialogContent,DialogActions, Button,} from "@mui/material";

const OtpDialog = ({ open, otp, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Verification Code
      </DialogTitle>
      <DialogContent>
        Your DMail verification OTP is:
        <h2 style={{
            textAlign: "center",
            letterSpacing: "6px",
            margin: "20px 0",
          }}>
          {otp}
        </h2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" > OK </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OtpDialog;