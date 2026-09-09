import { useState } from "react";
import { sendEmail } from "../../authApi/emailsApi";
import { toast } from "react-toastify";
import {
  canUseReplyOrForward,
  splitRecipients,
  joinRecipients,
  normalizeAttachments,
  readAttachmentFile,
} from "../../Utils/mailUtils";
import { findUserByEmail } from "../../authApi/authApi";
import "./ForwardEmail.css";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const ForwardEmail = ({ email, loggedInUser, onClose }) => {
 const [to, setTo] = useState("");
 const [message, setMessage] = useState("");
 const [sending, setSending] = useState(false);
 const [attachments, setAttachments] = useState([]);
 const handleAttachment = async (event) => {
   const files = Array.from(event.target.files || []);
   event.target.value = "";
   if (!files.length) return;
   const oversizedFile = files.find((file) => file.size > 70 * 1024);
   if (oversizedFile) {
     toast.error(`Attachment is too large (upto 70kb): ${oversizedFile.name}`);
     return;
   }
   try {
     const newAttachments = await Promise.all(files.map(readAttachmentFile));
     setAttachments((previous) => [...previous, ...newAttachments]);
   } catch (error) {
     console.error("Unable to read forward attachments", error);
     toast.error("Unable to read one or more attachments");
   }
 };

 const handleSendForward = async () => {
   if (!loggedInUser?.email) {
     toast.error("Please sign in to forward this email.");
     return;
   }

   if (!canUseReplyOrForward(email, loggedInUser.email)) {
     toast.error("This email is in Trash. Move it to Inbox to forward.");
     return;
   }

   if (!to.trim()) {
     toast.error("Please enter recipient email");
     return;
   }

   try {
     setSending(true);
     const recipients = splitRecipients(to);
     if (!recipients.length) {
       toast.error("Please enter valid recipient email(s)");
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
       toast.error(`Address not found: ${invalidRecipients.join(", ")}`);
       return;
     }

     const forwardedMessage = `${message.trim()}

---------- Forwarded message ----------
From: ${email.from}
To: ${email.to}
Subject: ${email.subject}

${email.message}`.trim();

     const forwardEmail = {
       from: loggedInUser.email,
       to: joinRecipients(validRecipients),
       subject: email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`,
       message: forwardedMessage,
       attachments: [
         ...normalizeAttachments(email),
         ...attachments,
       ],
     };

     await sendEmail(forwardEmail);
     toast.success("Forward sent successfully");
     setTo("");
     setMessage("");
     setAttachments([]);
     onClose();
   } catch (error) {
     console.error("Unable to forward email", error);
     toast.error("Unable to forward email");
   } finally {
     setSending(false);
   }
 };

 return (
   <div className="forward-box">
     <h3>Forward email</h3>
     <div className="forward-to">
       <label>To</label>
       <input
         type="text"
         value={to}
         onChange={(e) => setTo(e.target.value)}
         placeholder="Recipient email(s)"
       />
     </div>

     <textarea
       value={message}
       onChange={(e) => setMessage(e.target.value)}
       placeholder="Write your message..."
     />
     {attachments.length > 0 && (
       <div className="forward-attachment-list">
         {attachments.map((attachment, index) => (
           <div className="forward-attachment" key={`${attachment.name}-${index}`}>
             <span>{attachment.name}</span>
             <button
               type="button"
               onClick={() =>
                 setAttachments((previous) =>
                   previous.filter((attachment, itemIndex) => itemIndex !== index)
                 )
               }>
               Remove
             </button>
           </div>
         ))}
       </div>
     )}

     <div className="forwarded-preview">
       <div className="forwarded-line">---------- Forwarded message ----------</div>
       <div className="forwarded-header">
         <div>
           <strong>From:</strong> {email.from}
         </div>
         <div>
           <strong>To:</strong> {email.to}
         </div>
         <div>
           <strong>Subject:</strong> {email.subject}
         </div>
       </div>
       <pre className="forwarded-message">{email.message}</pre>
     </div>

     <div className="forward-actions">
       <label className="attachment-button">
         <AttachFileIcon />
         <input type="file" multiple onChange={handleAttachment} hidden />
       </label>
       <button onClick={handleSendForward} disabled={sending}>
         {sending ? "Sending..." : "Send"}
       </button>
       <button onClick={onClose}>Cancel</button>
     </div>
   </div>
 );
};

export default ForwardEmail;