import { useState } from "react";
import { sendEmail } from "../../authApi/emailsApi";
import { toast } from "react-toastify";
import { canUseReplyOrForward, splitRecipients, joinRecipients } from "../../Utils/mailUtils";
import { findUserByEmail } from "../../authApi/authApi";
import "./ForwardEmail.css";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const ForwardEmail = ({ email, loggedInUser, onClose }) => {
 const [to, setTo] = useState("");
 const [message, setMessage] = useState("");
 const [sending, setSending] = useState(false);
 const [attachment, setAttachment] = useState(null);
 const handleAttachment = (event) => {
   const file = event.target.files?.[0];
   if (!file) return;
   if (file.size > 70 * 1024) {
     toast.error("Attachment is too large (upto 70kb)");
     return;
   }
   const reader = new FileReader();
   reader.onload = () => setAttachment({ name: file.name, type: file.type, data: reader.result });
   reader.readAsDataURL(file);
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
       attachment: attachment || email.attachment || null,
     };

     await sendEmail(forwardEmail);
     toast.success("Forward sent successfully");
     setTo("");
     setMessage("");
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
     {attachment && <div className="forward-attachment">{attachment.name}</div>}

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
         <input type="file" onChange={handleAttachment} hidden />
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