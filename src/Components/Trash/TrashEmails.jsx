import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import { matchesAnyRecipient } from "../../Utils/mailUtils";

const TrashEmails = () => {
  const { loggedInUser } = useContext(UserContext);
  const { emails, search, filterEmails } = useOutletContext();

  const trashedMails = emails.filter(
    (email) =>
      (matchesAnyRecipient(email.to, loggedInUser.email) && email.receiverFolder === "trash") ||
      (email.from === loggedInUser.email && email.senderFolder === "trash"));

    const filteredEmails = [
        ...filterEmails(trashedMails, search)
    ].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return (
        <div className="inbox-container">
            <div className="email-list">
                {filteredEmails.length === 0 ? (
                    <p className="no-email">
                        {search.trim()
                            ? `No emails found for "${search}"`
                            : "Trash is empty"
                        }
                    </p>
                ) : (
                    filteredEmails.map((email) => (
                        <EmailRow
                            key={email.id}
                            email={email}
                            folder="trash" />
                    ))
                )}
            </div>
        </div>
    );
};

export default TrashEmails;