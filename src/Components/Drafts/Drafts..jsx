

import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import DraftRow from "./DraftRow";
import { isEmailForUser } from "../../Utils/mailUtils";

const Drafts = () => {

    const { loggedInUser } = useContext(UserContext);

    const {
        emails,
        search,
        filterEmails
    } = useOutletContext();

    // Get only draft emails
    const draftEmails = emails.filter(
        (email) =>
            isEmailForUser(email.from, loggedInUser) &&
            email.senderFolder === "draft"
    );

    // Search + sort
    const filteredEmails = [
        ...filterEmails(draftEmails, search)
    ].sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    return (
        <div className="draft-container">

            <div className="email-list">

                {filteredEmails.length === 0 ? (

                    <p className="no-email">
                        {search.trim()
                            ? `No dmails found for "${search}"`
                            : "No drafts available"
                        }
                    </p>

                ) : (

                    filteredEmails.map((email) => (

                        <DraftRow
                            key={email.id}
                            email={email}
                        />

                    ))

                )}

            </div>

        </div>
    );
};

export default Drafts;