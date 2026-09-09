import { useState } from "react";
import { sendEmail } from "../../authApi/emailsApi";
import { toast } from "react-toastify";
import {
  canUseReplyOrForward,
  readAttachmentFile,
} from "../../Utils/mailUtils";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import "./ReplyEmail.css";

const ReplyEmail = ({ email, loggedInUser, onClose, onReplySent }) => {
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
      console.error("Unable to read reply attachments", error);
      toast.error("Unable to read one or more attachments");
    }
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
        attachments,
        threadId,
      };

      const newReply = await sendEmail(replyEmail);
      console.log("newReply :: 60", newReply);
      if (newReply?.id) {
        onReplySent(newReply);
      }

      toast.success("Reply sent successfully");
      setMessage("");
      setAttachments([]);
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
      {attachments.length > 0 && (
        <div className="reply-attachment-list">
          {attachments.map((attachment, index) => (
            <div className="reply-attachment" key={`${attachment.name}-${index}`}>
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
          <input type="file" multiple onChange={handleAttachment} hidden />
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