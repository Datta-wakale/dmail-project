import Snackbar from "@mui/material/Snackbar";
import Button from "@mui/material/Button";

const ActionSnackbar = ({open, message,onAction,onClose}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      message={message}
      action={
        onAction && (
          <Button  color="secondary" size="small"
            onClick={onAction}>
            UNDO
          </Button>
        )
      }
    />
  );
};

export default ActionSnackbar;