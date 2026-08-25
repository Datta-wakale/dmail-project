import { useState } from "react";
import { sendEmail } from "../../authApi/emailsApi";
import { toast } from "react-toastify";
import "./ForwardEmail.css";

const ForwardEmail = ({
    email,
    loggedInUser,
    onClose
}) => {

    const [to, setTo] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSendForward = async () => {

        if (!to.trim()) {
            return;
        }
        try {
            setSending(true);
            const forwardEmail = {
                from: loggedInUser.email,
                to: to.trim(),
                subject: email.subject.startsWith("Fwd:")
                    ? email.subject
                    : `Fwd: ${email.subject}`,
                message: `${message.trim()}
                ----------------
                From: ${email.from}
                To: ${email.to}
               ${email.message}`,
                attachment: email.attachment || null,
            };
            await sendEmail(forwardEmail);
            toast.success("Forward sent successfully");
            setTo("");
            setMessage("");
            onClose();
        } catch (error) {
            console.error("Unable to forward email",  error );
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="forward-box">
            <h3> Forward email</h3>
            <input type="text"  value={to}
                onChange={(e) =>  setTo(e.target.value)  }
                placeholder="To" />

            <textarea  value={message} onChange={(e) =>
                    setMessage(e.target.value)  }
                placeholder="Write your message..." />
            <div>
                <button   onClick={handleSendForward}
                    disabled={sending} >
                    {sending
                        ? "Sending..."
                        : "Send"
                    }
                </button>
                <button
                    onClick={onClose} >
                    Cancel
                </button>
            </div>
        </div>
    );
};
export default ForwardEmail;