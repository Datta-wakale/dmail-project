import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import EmailRow from "../Components/EmailRow.jsx/EmailRow";
import { getVisibleEmails } from "../Utils/visibleEmails";
import { isEmailForUser } from "../Utils/mailUtils";

const Snoozed = () => {
    const { loggedInUser } = useContext(UserContext);
    const { emails, search, filterEmails } = useOutletContext();

    const filteredEmails = getVisibleEmails({
        emails,
        folder: "snooze",
        loggedInUser,
        search,
        filterEmails,
    });

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