import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "../EmailRow.jsx/EmailRow";
import DraftRow from "../Drafts/DraftRow";
import { getEmailFolderForUser } from "../../Utils/mailUtils";
import { getVisibleEmails } from "../../Utils/visibleEmails";

const AllDmails = () => {
    const { loggedInUser } = useContext(UserContext);

    const { emails, search, filterEmails} = useOutletContext();

    const filteredEmails = getVisibleEmails({ emails, folder: "all-mail",
        loggedInUser,
        search,
        filterEmails,
    });

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
                    filteredEmails.map((email) => {
                        // Draft should NEVER be rendered as a normal EmailRow
                        const isDraft =
                            email.senderFolder === "draft";
                        if (isDraft) {
                            return (
                                <DraftRow
                                    key={email.id}
                                    email={email}/>
                            );
                        }
                        const effectiveFolder = getEmailFolderForUser(email, loggedInUser);
                        return (
                            <EmailRow
                                key={email.id}
                                email={email}
                                folder={effectiveFolder || "inbox"}
                                viewFolder="all-mail"
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AllDmails;
