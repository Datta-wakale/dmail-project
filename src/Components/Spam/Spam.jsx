import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { deleteEmail, toggleStarEmail } from "../../authApi/emailsApi";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";

import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";


const Spam = () => {

  const { loggedInUser } = useContext(UserContext);

  const { emails,setEmails, openSelectedMail,search, filterEmails} = useOutletContext();

  // Only received spam emails
  const spamEmails = emails.filter(
    (email) =>email.to === loggedInUser.email &&
      email.receiverFolder === "spam");

  const filteredEmails = [...filterEmails(spamEmails, search)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Delete spam  Trash
  const handleDelete = async (event, id) =>{
    event.stopPropagation();
    try {
      await deleteEmail(id, "spam");

      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === id
            ? {
                ...email,
                receiverFolder: "trash",
              }
            : email
        )
      );
    } catch (error) {
      console.error("Unable to delete spam email", error);
    }
  };

  // Star / Unstar
  const handleStar = async (event, email) => {
    event.stopPropagation();

    const newStarredValue = !email.starred;

    try {
      await toggleStarEmail(email.id, newStarredValue);

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? {
                ...item,
                starred: newStarredValue,
              }
            : item
        )
      );
    } catch (error) {
      console.log("error is coming", error);
    }
  };

  return (
    <div className="spam-container">
      <div className="email-list">
        {filteredEmails.length === 0 ? (
          <p className="no-email">
            {search.trim()
              ? `no dmails found for ${search}`
              : `No dmails is present in spam`
            }
          </p>) : (
          filteredEmails.map((email) => (
            <div className="email-row"
              onClick={() =>   openSelectedMail(email.id, "spam")}
              key={email.id} >

              <Checkbox onClick={(event) => event.stopPropagation() }/>

              <IconButton onClick={(event) => handleStar(event, email)}>
                {email.starred ? (
                  <StarIcon className="star-active" />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
              <div className="email-sender">
                {email.from}
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
                onClick={(event) =>
                  handleDelete(event, email.id)
                }
              >
                <DeleteIcon />
              </IconButton>
            </div>))
        )}
      </div>
    </div>
  );
};
export default Spam;