import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import { getVisibleEmails } from "../../Utils/visibleEmails";

const Inbox = () => {
const { loggedInUser } = useContext(UserContext);
const {
    emails,
    search,
    filterEmails,
    selectedCategory
} = useOutletContext();

const filteredEmails = getVisibleEmails({
    emails,
    folder: "inbox",
    loggedInUser,
    search,
    filterEmails,
    selectedCategory,
});

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