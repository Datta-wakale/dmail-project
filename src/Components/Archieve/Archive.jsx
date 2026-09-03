import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "./..//EmailRow.jsx/EmailRow"
import { getVisibleEmails } from "../../Utils/visibleEmails";

const Archive = () => {
  const { loggedInUser } = useContext(UserContext);
  const { emails, search, filterEmails } = useOutletContext();
  const archivedEmails = getVisibleEmails({
    emails,
    folder: "archive",
    loggedInUser,
    search,
    filterEmails,
  });

  return (
    <div className="email-list">
      {archivedEmails.length === 0 ? (
        <div className="empty-folder">
          No archived emails
        </div>
      ) : (
        archivedEmails.map((email) => (
          <EmailRow key={email.id}
            email={email} folder="archive" />
        ))
      )}
    </div>
  );
};
export default Archive; 
