import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import { matchesAnyRecipient } from "../../Utils/mailUtils";

const AllDmails = () => {
    const { loggedInUser } = useContext(UserContext);
    const {
        emails,
        search,
        filterEmails
    } = useOutletContext();

    const allMails = emails.filter((email) => {
        if (email.from === loggedInUser.email) {
            return email.senderFolder !== "trash";
        }
        if (matchesAnyRecipient(email.to, loggedInUser.email)) {
            return email.receiverFolder !== "trash";
        }
        return false;
    });

    const filteredEmails = [
        ...filterEmails(allMails, search)
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="all-mail-container">
            <div className="email-list">
                {filteredEmails.length === 0 ? (
                    <p className="no-email">
                        {search.trim()
                            ? `No dmails found for "${search}"`
                            : "No emails available"
                        }
                    </p>
                ) : (
                    filteredEmails.map((email) => (
                        <EmailRow key={email.id}
                            email={email}
                            folder={
                                email.from === loggedInUser.email
                                    ? "sent"
                                    : "inbox"
                            } />
                    ))
                )}
            </div>
        </div>
    );
};
export default AllDmails;