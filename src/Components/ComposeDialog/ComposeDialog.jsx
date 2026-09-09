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
import {splitRecipients, joinRecipients, normalizeAttachments,readAttachmentFile,} from "../../Utils/mailUtils";
import "./ComposeDialog.css";

const ComposeDialog = ({ open, onClose, onEmailSent, draftToEdit, onDraftSaved, currentFolder }) => {
const { loggedInUser } = useContext(UserContext);
console.log("loggedInUser in ComposeDialog:: 18", loggedInUser);
const [mail, setMail] = useState({
  to: "",
  subject: "",
  message: "",
  attachments: [],
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

const handleAttachment = async (event) => {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length) {
    return;
  }

  const maxSize = 70 * 1024;
  const oversizedFile = files.find((file) => file.size > maxSize);
  if (oversizedFile) {
    setError(`Attachment is too large (upto 70kb): ${oversizedFile.name}`);
    return;
  }

  try {
    const newAttachments = await Promise.all(files.map(readAttachmentFile));
    setMail((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));
    setError("");
  } catch (error) {
    console.error("Unable to read attachments", error);
    setError("Unable to read one or more attachments");
  }
};

const handleSend = async () => {
  isSending.current = true;

  if (!mail.to.trim()) {
    setError("Recipient Dmail is required");
    isSending.current = false;
    return;
  }

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
      attachments: mail.attachments,
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
      attachments: [],
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
    mail.attachments.length;

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
      attachments: mail.attachments,
      createdAt: new Date().toISOString(),
      senderOriginFolder: draftToEdit?.senderOriginFolder ||
        draftToEdit?.originFolder ||
        (["inbox", "sent", "spam", "archive"].includes(currentFolder)
          ? currentFolder
          : null),
    };

    if (draftToEdit) {
      const originalDraft = originalDraftRef.current || {
        to: draftToEdit.to || "",
        subject: draftToEdit.subject || "",
        message: draftToEdit.message || "",
        attachments: normalizeAttachments(draftToEdit),
      };

      const hasDraftChanges = JSON.stringify({
        to: draftData.to,
        subject: draftData.subject,
        message: draftData.message,
        attachments: draftData.attachments,
      }) !== JSON.stringify({
        to: originalDraft.to,
        subject: originalDraft.subject,
        message: originalDraft.message,
        attachments: originalDraft.attachments,
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
        senderOriginFolder: draftToEdit.senderOriginFolder ||
          draftToEdit.originFolder ||
          draftData.senderOriginFolder ||
          null,
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
        attachments: normalizeAttachments(draftToEdit),
      }
    : {
        to: "",
        subject: "",
        message: "",
        attachments: [],
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
             }} >
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

         {mail.attachments.length > 0 && (
           <div className="attachment-list">
             {mail.attachments.map((attachment, index) => (
               <div className="attachment-preview" key={`${attachment.name}-${index}`}>
                 {attachment.type?.startsWith("image/") && (
                   <img src={attachment.data} alt={attachment.name} />
                 )}
                 <span>{attachment.name}</span>
                 <button
                   type="button"
                   onClick={() =>
                     setMail((prev) => ({
                       ...prev,
                       attachments: prev.attachments.filter((attachment, itemIndex) => itemIndex !== index),
                     }))
                   }>
                   <CloseIcon />
                 </button>
               </div>
             ))}
           </div>
         )}

         {error && <p className="compose-error">{error}</p>}

         <div className="compose-footer">
           <label className="attachment-button">
             <AttachFileIcon />
             <input type="file" accept="image/*" multiple onChange={handleAttachment} hidden />
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