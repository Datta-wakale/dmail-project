import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../../Context/UserContext";
import { findUserByEmail } from "../../authApi/authApi";
import { sendEmail, saveDraft, deleteDraft, updateDraft } from "../../authApi/emailsApi";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import RemoveIcon from "@mui/icons-material/Remove";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { toast } from "react-toastify";
import { splitRecipients, joinRecipients } from "../../Utils/mailUtils";
import "./ComposeDialog.css";

const ComposeDialog = ({ open, onClose, onEmailSent, draftToEdit, onDraftSaved }) => {
const { loggedInUser } = useContext(UserContext);
console.log("loggedInUser in ComposeDialog:: 18", loggedInUser);
const [mail, setMail] = useState({
  to: "",
  subject: "",
  message: "",
  attachment: null,
});
const [minimized, setMinimized] = useState(false);
const [addressNotFound, setAddressNotFound] = useState(null);
const isSending = useRef(false);
const originalDraftRef = useRef(null);
const [error, setError] = useState("");

const handleChange = (event) => {
  const { name, value } = event.target;
  setMail((prev) => ({
    ...prev,
    [name]: value,
  }));
  setError("");
};

const [toFocused, setToFocused] = useState(false);

const handleAttachment = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const maxSize = 70 * 1024;
  if (file.size > maxSize) {
    setError("Attachment is too large (upto 70kb)");
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

const handleSend = async () => {
  isSending.current = true;

  if (!mail.to.trim()) {
    setError("Recipient Dmail is required");
    isSending.current = false;
    return;
  }

  // if (!mail.subject.trim()) {
  //   setError("Subject is required");
  //   isSending.current = false;
  //   return;
  // }

  if (!mail.message.trim()) {
    setError("Message is required");
      isSending.current = false;
      return;
    }

  try {
    const recipients = splitRecipients(mail.to);
    if (recipients.length === 0) {
      setError("Recipient Dmail is required");
      isSending.current = false;
      return;
    }

    const invalidRecipients = [];
    const validRecipients = [];

    for (const recipient of recipients) {
      const userExists = await findUserByEmail(recipient);
      if (!userExists) {
         invalidRecipients.push(recipient);
      } else {
         validRecipients.push(recipient);
      }
    }

    if (invalidRecipients.length) {
      setAddressNotFound(invalidRecipients);
      setError(`Address not found: ${invalidRecipients.join(", ")}`);
      isSending.current = false;
      return;
    }

    const emailData = {
      from: loggedInUser.email,
      to: joinRecipients(validRecipients),
      subject: mail.subject.trim(),
      message: mail.message.trim(),
      createdAt: new Date().toISOString(),
      attachment: mail.attachment,
    };

    const newEmail = await sendEmail(emailData);
    if (draftToEdit) {
      await deleteDraft(draftToEdit.id);
    }

    onEmailSent(newEmail, draftToEdit?.id);
    toast.success("Dmail sent successfully");
    setMail({
      to: "",
      subject: "",
      message: "",
      attachment: null,
    });
    setError("");
    onClose();
  } catch (error) {
    console.error(error);
    setError("Unable to send this Dmail");
  } finally {
    isSending.current = false;
  }
};

const handleClose = async () => {
  if (isSending.current) {
    onClose();
    return;
  }

  const hasContent =
    mail.to.trim() ||
    mail.subject.trim() ||
    mail.message.trim() ||
    mail.attachment;

  if (!hasContent) {
    onClose();
    return;
  }

  try {
    const draftData = {
      from: loggedInUser.email,
      to: mail.to.trim(),
      subject: mail.subject.trim(),
      message: mail.message.trim(),
      attachment: mail.attachment,
      createdAt: new Date().toISOString(),
    };

    if (draftToEdit) {
      const originalDraft = originalDraftRef.current || {
        to: draftToEdit.to || "",
        subject: draftToEdit.subject || "",
        message: draftToEdit.message || "",
        attachment: draftToEdit.attachment || null,
      };

      const hasDraftChanges = JSON.stringify({
        to: draftData.to,
        subject: draftData.subject,
        message: draftData.message,
        attachment: draftData.attachment,
      }) !== JSON.stringify({
        to: originalDraft.to,
        subject: originalDraft.subject,
        message: originalDraft.message,
        attachment: originalDraft.attachment,
      });

      if (!hasDraftChanges) {
        onClose();
        return;
      }

      const updatedDraft = await updateDraft(draftToEdit.id, {
        ...draftToEdit,
        ...draftData,
        id: draftToEdit.id,
        senderFolder: "draft",
      });
      onDraftSaved(updatedDraft);
      onClose();
      return;
    }

    const newDraft = await saveDraft(draftData);
    onDraftSaved(newDraft);
    onClose();
  } catch (error) {
    console.error("Unable to save draft", error);
  }
};

useEffect(() => {
  if (!open) {
    return;
  }

  isSending.current = false;

  const resetComposeState = () => {
    setMinimized(false);
    setError("");
    setAddressNotFound(null);
    setToFocused(false);
  };

  const nextDraft = draftToEdit
    ? {
        to: draftToEdit.to || "",
        subject: draftToEdit.subject || "",
        message: draftToEdit.message || "",
        attachment: draftToEdit.attachment || null,
      }
    : {
        to: "",
        subject: "",
        message: "",
        attachment: null,
      };

  const timer = setTimeout(() => {
    resetComposeState();
    setMail(nextDraft);
    originalDraftRef.current = nextDraft;
  }, 0);

  return () => clearTimeout(timer);
}, [open, draftToEdit]);

return (
  <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
    {addressNotFound ? (
      <div className="address-not-found-page">
         <div className="address-not-found-header">
           <h3>Address not found</h3>
           <IconButton onClick={() => {
             setAddressNotFound(null);
             setError("");
           }} aria-label="Close address not found">
             <CloseIcon />
           </IconButton>
         </div>

         <div className="address-not-found-body">
           <p>
             We couldn’t find these addresses in D-mail:
           </p>
           <ul>
             {addressNotFound.map((email) => (
               <li key={email}>{email}</li>
             ))}
           </ul>
           <button
             type="button"
             className="address-not-found-btn"
             onClick={() => {
               setAddressNotFound(null);
               setError("");
             }}
           >
             Try another address
           </button>
         </div>
      </div>
    ) : minimized ? (
      <div className="compose-minimized">
         <span>New Message</span>
         <IconButton onClick={() => setMinimized(false)}>
           <OpenInFullIcon />
         </IconButton>
      </div>
    ) : (
      <div className="compose-dialog">
         <div className="compose-header">
           <h3>New Message</h3>
           <div className="compose-header-actions">
             <IconButton onClick={() => setMinimized(true)} aria-label="Minimize compose">
               <RemoveIcon />
             </IconButton>
             <IconButton onClick={handleClose} aria-label="Close compose">
               <CloseIcon />
             </IconButton>
           </div>
         </div>

         <div className="recipient-wrapper">
           {toFocused && <span className="recipient-label">To</span>}
           <input
             type="text"
             name="to"
             value={mail.to}
             onChange={handleChange}
             onFocus={() => setToFocused(true)}
             onBlur={() => setToFocused(false)}
             placeholder={!toFocused ? "Recipients" : ""}
             className="compose-input"
           />
         </div>

         <input
           type="text"
           name="subject"
           value={mail.subject}
           onChange={handleChange}
           placeholder="Subject"
           className="compose-input"
         />

         <textarea
           name="message"
           value={mail.message}
           onChange={handleChange}
           placeholder="Write your message..."
           className="compose-message"
         />

         {mail.attachment && (
           <div className="attachment-preview">
             <img src={mail.attachment.data} alt={mail.attachment.name} />
             <span>{mail.attachment.name}</span>
             <button
               type="button"
               onClick={() =>
                 setMail((prev) => ({
                   ...prev,
                   attachment: null,
                 }))
               }>
               <CloseIcon />
             </button>
           </div>
         )}

         {error && <p className="compose-error">{error}</p>}

         <div className="compose-footer">
           <label className="attachment-button">
             <AttachFileIcon />
             <input type="file" accept="image/*" onChange={handleAttachment} hidden />
           </label>
           <button className="send-button" onClick={handleSend}>
             <SendIcon />
             Send
           </button>
         </div>
      </div>
    )}
  </Dialog>
);
};

export default ComposeDialog;