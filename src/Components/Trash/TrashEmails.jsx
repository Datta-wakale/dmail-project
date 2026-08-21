import { useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import { useOutletContext } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { permanentlyDeleteEmail } from "../../authApi/emailsApi";
const TrashEmails = () => {
  const { loggedInUser } = useContext(UserContext);
  const { emails, openSelectedMail, setEmails, search, filterEmails } = useOutletContext();
  const trashedMails = emails.filter(
    (email) => (email.to === loggedInUser.email &&
      email.receiverFolder === "trash") ||
      (email.from === loggedInUser.email &&
        email.senderFolder === "trash"));
  // const filteredEmails = filterEmails(trashedMails, search);
  const filteredEmails = [...filterEmails(trashedMails, search)]
  .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  console.log(":: filteredEmails",filteredEmails);
  
  const handlePermanentDelete = async (event, email) => {

    event.stopPropagation();
    try {
      const folder = email.from === loggedInUser.email ? "sent" : "inbox";
      await permanentlyDeleteEmail(email.id, folder);
      setEmails((prevEmails) =>
        prevEmails.filter((mail) => mail.id !== email.id));
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
  }

  return (
    <div className="inbox-container">
      <div className="email-list">
        {filteredEmails.length === 0 ? (
          <p className="no-email">
            {search.trim()
              ? `No emails found for "${search}"`
              : "Trash is empty"}
          </p>
        ) : (
          filteredEmails.map((email) => (
            <div className="email-row" key={email.id}
              onClick={() => openSelectedMail(email.id)}  >
              <Checkbox onClick={(event) => event.stopPropagation()} />
              <div className="email-sender">
                {email.from === loggedInUser.email
                  ? email.to
                  : email.from}
              </div>
              <div className="email-content">
                <span className="email-subject">
                  {email.subject}
                </span>
                <span className="email-preview">
                  {" - " + email.message}
                </span>
              </div>
              <div className="email-date">
                {email.date || "Today"}
              </div>
              <IconButton
                onClick={(event) => handlePermanentDelete(event, email)}>
                <DeleteIcon />
              </IconButton>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default TrashEmails;