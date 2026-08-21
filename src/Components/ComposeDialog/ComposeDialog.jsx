import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { checkEmailExists } from "../../authApi/authApi";
import { sendEmail } from "../../authApi/emailsApi";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { toast } from "react-toastify";
import "./ComposeDialog.css";
const ComposeDialog = ({ open, onClose, onEmailSent }) => {
  const { loggedInUser } = useContext(UserContext);
  const [mail, setMail] = useState({
    to: "",
    subject: "",
    message: "",
    attachment: null,
  });
  const [error, setError] = useState("");
  // Input change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setMail((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };
 const [toFocused, setToFocused] = useState(false);
  // Attachment
  const handleAttachment = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // check attachment size before sending dmail
    const maxSize = 70 * 1024;
    console.log("actual file size :: ", file.size);
    if (file.size > maxSize) {
      setError("attachment is too large (upto 70kb)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMail((prev) => ({
        ...prev,
        attachment: {
          name: file.name,
          type: file.type,
          data: reader.result,
        },
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  };
  // Send email
  const handleSend = async () => {
    // Validation
    if (!mail.to.trim()) {
      setError("Recipient Dmail is required");
      return;
    }
    if (!mail.subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!mail.message.trim()) {
      setError("Message is required");
      return;
    }
    try {
      // Check recipient
      const recipient = await checkEmailExists(mail.to.trim());
      if (!recipient) {
        setError("Recipient Dmail does not exist");
        return;
      }
      // Create email object
      const emailData = {
        from: loggedInUser.email,
        to: recipient.email,
        subject: mail.subject.trim(),
        message: mail.message.trim(),
        createdAt: new Date().toISOString(),
        attachment: mail.attachment,
      };
      // Send email
      const newEmail = await sendEmail(emailData);
      onEmailSent(newEmail);
      toast.success("Dmail sent successfully");
      // Clear form
      setMail({ to: "", subject: "", message: "", attachment: null, });
      setError("");
      // Close dialog
      onClose();
    } catch (error) {
      console.error(error);
      setError("Unable to send an Dmail");
    }
  };

  useEffect(()=> {
      if(open){
        setMail({
          to: "",
          subject: "",
          message: "",
          attachment: ""
        })
        setError("");
        setToFocused(false);
      }
  },[open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <div className="compose-dialog">
        <div className="compose-header">
          <h3>New Message</h3>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="recipient-wrapper">
          {toFocused && <span className="recipient-label">To</span>}

          <input type="email" name="to"
            value={mail.to} onChange={handleChange}
            onFocus={() => setToFocused(true)}
            onBlur={() => setToFocused(false)}
            placeholder={!toFocused ? "Recipients" : ""}
            className="compose-input" />
        </div>

        <input type="text" name="subject" value={mail.subject}
          onChange={handleChange} placeholder="Subject"
          className="compose-input" />
        <textarea name="message" value={mail.message}
          onChange={handleChange} placeholder="Write your message..."
          className="compose-message" />

        {mail.attachment && (
          <div className="attachment-preview">
            <img src={mail.attachment.data}
              alt={mail.attachment.name} />
            <span>{mail.attachment.name} </span>
            <button type="button" onClick={() =>
              setMail((prev) => ({
                ...prev,
                attachment: null,
              }))
            }>
              <CloseIcon />
            </button>
          </div>
        )}
        {error && (<p className="compose-error">  {error}</p>)}
        <div className="compose-footer">
          <label className="attachment-button">
            <AttachFileIcon />
            <input type="file" accept="image/*"
              onChange={handleAttachment} hidden />
          </label>
          <button className="send-button" onClick={handleSend}>
            <SendIcon />
            Send 
            </button>
        </div>
      </div>
    </Dialog>
  );
};
export default ComposeDialog;