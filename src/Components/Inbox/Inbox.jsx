import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import getEmailCategory from "../../Utils/emailsCategoriesUtils";
import { matchesAnyRecipient } from "../../Utils/mailUtils";

const Inbox = () => {
const { loggedInUser } = useContext(UserContext);
const {
    emails,
    search,
    filterEmails,
    selectedCategory
} = useOutletContext();

const receivedEmails = emails.filter(
    (email) =>
        matchesAnyRecipient(email.to, loggedInUser.email) &&
        email.receiverFolder === "inbox" &&
        !email.receiverSnoozedUntil
);
    // Category filter
    const categoryEmails = receivedEmails.filter(
        (email) =>
            getEmailCategory(email) === selectedCategory
    );
    // Search + sort
    const filteredEmails = [
        ...filterEmails(
            categoryEmails,
            search )
    ].sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    return (
        <div className="inbox-container">
            <div className="email-list">
                {filteredEmails.length === 0 ? (
                    <p className="no-email">
                        {search.trim()
                            ? `no dmails found for ${search}`
                            : "No dmails is present in your inbox"
                        }
                    </p>

                ) : (
                    filteredEmails.map((email) => (
                        <EmailRow
                            key={email.id}
                            email={email}
                            folder="inbox"
                        />  ))
                )}
            </div>
        </div>
    );
};

export default Inbox;