import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import { isEmailForUser, matchesAnyRecipient } from "../../Utils/mailUtils";

const StarredEmails = () => {

    const { loggedInUser } = useContext(UserContext);

    const {
        emails,
        search,
        filterEmails
    } = useOutletContext();

    const starredEmails = emails.filter(
        (email) =>
            email.starred === true &&
            (
                isEmailForUser(email.from, loggedInUser) ||
                matchesAnyRecipient(email.to, loggedInUser)
            )
    );

    // Search + sort
    const filteredEmails = [
        ...filterEmails(starredEmails, search)
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
                            ? `No search found ${search} in starred dmail`
                            : "No starred dmail is present"
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

export default StarredEmails;