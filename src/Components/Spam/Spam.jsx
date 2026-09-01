import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import { isEmailForUser, matchesAnyRecipient } from "../../Utils/mailUtils";

const Spam = () => {
 const { loggedInUser } = useContext(UserContext);

 const { emails, search, filterEmails } = useOutletContext();

 const spamEmails = emails.filter(
   (email) =>
     (matchesAnyRecipient(email.to, loggedInUser) && email.receiverFolder === "spam") ||
     (isEmailForUser(email.from, loggedInUser) && email.senderFolder === "spam")
 );
    // Search + sort
    const filteredEmails = [
        ...filterEmails(spamEmails, search)
    ].sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    return (
        <div className="spam-container">

            <div className="email-list">

                {filteredEmails.length === 0 ? (

                    <p className="no-email">

                        {search.trim()
                            ? `No dmails found for ${search}`
                            : "No dmails is present in spam"
                        }

                    </p>

                ) : (

                    filteredEmails.map((email) => (

                        <EmailRow
                            key={email.id}
                            email={email}
                            folder="spam"
                        />

                    ))

                )}

            </div>

        </div>
    );
};

export default Spam;