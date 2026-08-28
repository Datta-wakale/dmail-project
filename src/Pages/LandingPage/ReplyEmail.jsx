import { useState } from "react";
import { sendEmail } from "../../authApi/emailsApi";
import { toast } from "react-toastify";
import "./ReplyEmail.css";

const ReplyEmail = ({ email, loggedInUser, onClose, onReplySent }) => {

    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSendReply = async () => {
        if (!message.trim()) {
            return;
        }
        try {
            setSending(true);
            // Keep the original conversation id
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
                subject: email.subject.startsWith("Re:")
                    ? email.subject
                    : `Re: ${email.subject}`,
                message: replyMessage,
                attachment: null,
                threadId: threadId,
            };
            // await sendEmail(replyEmail);
            // toast.success("Reply sent successfully");
            // setMessage("");
            // onClose();
            const newReply = await sendEmail(replyEmail);
            console.log("NEW REPLY:", newReply);
            console.log("NEW REPLY ID:", newReply?.id);
            console.log("NEW REPLY THREAD:", newReply?.threadId);
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
                <input type="text" value={email.from}
                    readOnly />
            </div>

            <textarea value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your reply..." />

            <div className="original-email">
                <div className="original-line">
                    ---------- Original message ----------
                </div>
                <div className="original-header">
                    <div> <strong>From:</strong> {email.from} </div>
                    <div> <strong>To:</strong> {email.to} </div>
                    <div> <strong>Subject:</strong> {email.subject} </div>
                </div>
                <pre className="original-message">
                    {email.message}
                </pre>
            </div>

            <div className="reply-actions">
                <button onClick={handleSendReply}
                    disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                </button>
                <button onClick={onClose}>  Cancel </button>
            </div>
        </div>
    );
};
export default ReplyEmail;