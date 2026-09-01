import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import EmailRow from "../Components/EmailRow.jsx/EmailRow";
import { isEmailForUser, matchesAnyRecipient } from "../Utils/mailUtils";

const Snoozed = () => {
    const { loggedInUser } = useContext(UserContext);
    const { emails, search, filterEmails } = useOutletContext();

    const now = new Date();
    
    const snoozedEmails = emails.filter((email) => {
        if (matchesAnyRecipient(email.to, loggedInUser)) {
            return (
                email.receiverSnoozedUntil &&
                new Date(email.receiverSnoozedUntil) > now
            );
        }

        if (isEmailForUser(email.from, loggedInUser)) {
            return (
                email.senderSnoozedUntil &&
                new Date(email.senderSnoozedUntil) > now
            );
        }

        return false;
    });

    const filteredEmails = [
        ...filterEmails(snoozedEmails, search)
    ].sort((a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt));

    return (
        <div className="snoozed-container">
            <div className="email-list">

                {filteredEmails.length === 0 ? (
                    <p className="no-email">
                        {search.trim()
                            ? `No dmails found for "${search}"`
                            : "No snoozed dmails"
                        }
                    </p>
                ) : (
                    filteredEmails.map((email) => (
                        <EmailRow
                            key={email.id}
                            email={email}
                            folder={
                                isEmailForUser(email.from, loggedInUser)
                                    ? "sent"
                                    : "inbox"
                            }
                        />
                    ))
                )}

            </div>
        </div>
    );
};
export default Snoozed;