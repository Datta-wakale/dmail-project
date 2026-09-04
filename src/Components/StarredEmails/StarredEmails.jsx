import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import DraftRow from "../Drafts/DraftRow";
import { getVisibleEmails } from "../../Utils/visibleEmails";
import { isEmailForUser } from "../../Utils/mailUtils";

const StarredEmails = () => {

    const { loggedInUser } = useContext(UserContext);

    const { emails, search, filterEmails } = useOutletContext();
    const filteredEmails = getVisibleEmails({
        emails,
        folder: "starred",
        loggedInUser,
        search,
        filterEmails,
    });

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

                        (email.isDraft === true || email.senderFolder === "draft") ? (
                            <DraftRow key={email.id} email={email} folder="draft" />
                        ) : (
                            <EmailRow
                                key={email.id}
                                email={email}
                                folder={
                                    isEmailForUser(email.from, loggedInUser)
                                        ? "sent"
                                        : "inbox"
                                }
                                viewFolder="starred"
                                isStarredView={true}
                            />
                        )

                    ))

                )}

            </div>

        </div>
    );
};
export default StarredEmails;