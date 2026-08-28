import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";

const SentEmails = () => {

    const { loggedInUser } = useContext(UserContext);

    const {
        emails,
        search,
        filterEmails
    } = useOutletContext();

    // Get only sent mails
    const sentEmails = emails.filter(
        (email) =>
            email.from === loggedInUser.email &&
            email.senderFolder === "sent"
    );

    // Search + sort
    const filteredEmails = [
        ...filterEmails(sentEmails, search)
    ].sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    return (
        <div className="sent-container">
            <div className="email-list">
                {filteredEmails.length === 0 ? (
                    <p className="no-email">
                        {search.trim()
                            ? `No dmails found for "${search}"`
                            : "No sent dmails available"
                        }
                    </p>
                ) : (
                    filteredEmails.map((email) => (
                        <EmailRow
                            key={email.id}
                            email={email}
                            folder="sent"
                        />
                    ))
                )}
            </div>

        </div>
    );
};
export default SentEmails;