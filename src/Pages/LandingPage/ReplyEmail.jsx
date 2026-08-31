import { useState } from "react";
import { sendEmail } from "../../authApi/emailsApi";
import { toast } from "react-toastify";
import { canUseReplyOrForward } from "../../Utils/mailUtils";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import "./ReplyEmail.css";

const ReplyEmail = ({ email, loggedInUser, onClose, onReplySent }) => {
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

  const handleSendReply = async () => {
    if (!loggedInUser?.email) {
      toast.error("Please sign in to reply to this email.");
      return;
    }

    if (!canUseReplyOrForward(email, loggedInUser.email)) {
      toast.error("This email is in Trash. Move it to Inbox to reply.");
      return;
    }

    if (!message.trim()) {
      return;
    }

    try {
      setSending(true);
      const threadId = email.threadId || email.id;
      const replyMessage = `${message.trim()}
            ---------- Original message ----------
            From: ${email.from}
            To: ${email.to}
            Subject: ${email.subject}
            ${email.message}`.trim();

      const replyEmail = {
        from: loggedInUser.email,
        to: email.from,
        subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
        message: replyMessage,
        attachment,
        threadId,
      };

      const newReply = await sendEmail(replyEmail);
      if (newReply?.id) {
        onReplySent(newReply);
      }

      toast.success("Reply sent successfully");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Unable to send reply", error);
      toast.error("Unable to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="reply-box">
      <h3>Reply</h3>
      <div className="reply-to">
        <label>To</label>
        <input type="text" value={email.from} readOnly />
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your reply..."
      />
      {attachment && <div className="reply-attachment">{attachment.name}</div>}

      <div className="original-email">
        <div className="original-line">---------- Original message ----------</div>
        <div className="original-header">
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
        <pre className="original-message">{email.message}</pre>
      </div>

      <div className="reply-actions">
        <label className="attachment-button">
          <AttachFileIcon />
          <input type="file" onChange={handleAttachment} hidden />
        </label>
        <button onClick={handleSendReply} disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ReplyEmail;