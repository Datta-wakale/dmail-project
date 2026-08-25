import { useState } from "react";
import { sendEmail } from "../../authApi/emailsApi";
import { toast } from "react-toastify";
import "./ReplyEmail.css";

const ReplyEmail = ({ email, loggedInUser, onClose }) => {

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
            const replyEmail = {
                from: loggedInUser.email,
                to: email.from,

                subject: email.subject.startsWith("Re:")
                    ? email.subject
                    : `Re: ${email.subject}`,

                message: message.trim(),
                attachment: null,
                // NEW: conversation/thread reference
                threadId: threadId,
            };
            await sendEmail(replyEmail);
            toast.success("Reply sent successfully");
            setMessage("");
            onClose();

        } catch (error) {

            console.error(
                "Unable to send reply",
                error
            );

        } finally {
            setSending(false);
        }
    };
    return (
        <div className="reply-box">

            <h3>
                Reply to {email.from}
            </h3>
            <textarea
                value={message}
                onChange={(e) =>
                    setMessage(e.target.value)
                }
                placeholder="Write your reply..."
            />
            <div>

                <button
                    onClick={handleSendReply}
                    disabled={sending}
                >
                    {sending
                        ? "Sending..."
                        : "Send"
                    }
                </button>
                <button
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
export default ReplyEmail;