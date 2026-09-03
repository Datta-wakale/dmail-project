import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import DraftRow from "../Drafts/DraftRow";
import { getVisibleEmails } from "../../Utils/visibleEmails";

const TrashEmails = () => {
  const { loggedInUser } = useContext(UserContext);
  const { emails, search, filterEmails } = useOutletContext();
  const filteredEmails = getVisibleEmails({
    emails,
    folder: "trash",
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
                            ? `No emails found for "${search}"`
                            : "Trash is empty"
                        }
                    </p>
                ) : (
                    filteredEmails.map((email) => (
                        (email.isDraft === true || email.senderFolder === "draft") ? (
                            <DraftRow
                                key={email.id}
                                email={email}
                                folder="trash"
                            />
                        ) : (
                            <EmailRow
                                key={email.id}
                                email={email}
                                folder="trash"
                            />
                        )
                    ))
                )}
            </div>
        </div>
    );
};

export default TrashEmails;