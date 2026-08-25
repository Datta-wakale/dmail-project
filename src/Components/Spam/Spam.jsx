import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";

import EmailRow from "../EmailRow.jsx/EmailRow";

const Spam = () => {

    const { loggedInUser } = useContext(UserContext);

    const {
        emails,
        search,
        filterEmails
    } = useOutletContext();

    // Only received spam emails
    const spamEmails = emails.filter(
        (email) =>
            email.to === loggedInUser.email &&
            email.receiverFolder === "spam"
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