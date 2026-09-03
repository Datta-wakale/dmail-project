

import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import DraftRow from "./DraftRow";
import { getVisibleEmails } from "../../Utils/visibleEmails";

const Drafts = () => {

    const { loggedInUser } = useContext(UserContext);

    const {
        emails,
        search,
        filterEmails
    } = useOutletContext();

    const filteredEmails = getVisibleEmails({
        emails,
        folder: "drafts",
        loggedInUser,
        search,
        filterEmails,
    });

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
                            folder="draft"
                        />

                    ))

                )}

            </div>

        </div>
    );
};

export default Drafts;