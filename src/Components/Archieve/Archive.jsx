import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import EmailRow from "./..//EmailRow.jsx/EmailRow"
import { matchesAnyRecipient,normalizeEmailAddress,} from "../../Utils/mailUtils";

const Archive = () => {
  const { loggedInUser } = useContext(UserContext);
  const { emails } = useOutletContext();
  console.log("emails ::7", emails);
  const userEmail = normalizeEmailAddress(loggedInUser?.email);
  console.log("userEmail ::10", userEmail);
  const archivedEmails = emails.filter((email) => {
    const isSentByUser = normalizeEmailAddress(email.from) === userEmail;
    console.log("isSentByUser ::15", isSentByUser);

    const isReceivedByUser = matchesAnyRecipient(email.to, loggedInUser);
    console.log("isReceivedByUser ::18", isReceivedByUser);
    if (isSentByUser) {
      return email.senderFolder === "archive";
    }

    if (isReceivedByUser) {
      return email.receiverFolder === "archive";
    }

    return false;
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
