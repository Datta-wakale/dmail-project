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
            toast.error("Please enter recipient email");
            return;
        }

        try {
            setSending(true);

            const forwardedMessage = `${message.trim()}

---------- Forwarded message ----------
From: ${email.from}
To: ${email.to}
Subject: ${email.subject}

${email.message}`.trim();

            const forwardEmail = {
                from: loggedInUser.email,
                to: to.trim(),
                subject: email.subject.startsWith("Fwd:")
                    ? email.subject
                    : `Fwd: ${email.subject}`,
                message: forwardedMessage,
                attachment: email.attachment || null,
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

                <input type="text"  value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Recipient email" />
            </div>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."/>
            <div className="forwarded-preview">
                <div className="forwarded-line">
                    ---------- Forwarded message ----------
                </div>
                <div className="forwarded-header">
                    <div>  <strong>From:</strong> {email.from}  </div>
                    <div>
                        <strong>To:</strong> {email.to}
                    </div>
                    <div>
                        <strong>Subject:</strong> {email.subject}
                    </div>
                </div>
                <pre className="forwarded-message">
                    {email.message}
                </pre>
            </div>
            <div className="forward-actions">
                <button onClick={handleSendForward}
                    disabled={sending} >
                    {sending ? "Sending..." : "Send"}
                </button>

                <button onClick={onClose}>
                    Cancel
                </button>

            </div>

        </div>
    );
};

export default ForwardEmail;