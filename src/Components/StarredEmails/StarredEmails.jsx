import { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";

import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";

import StarIcon from "@mui/icons-material/Star";

const StarredEmails = () => {
  const { emails, setEmails, openSelectedMail,search,filterEmails } = useOutletContext();
  const { loggedInUser } = useContext(UserContext);

  // Get all starred emails related to logged-in user
  const starredEmails = emails.filter(
    (email) =>
      email.starred === true &&
      (email.from === loggedInUser.email ||
        email.to === loggedInUser.email)
  );
const filteredEmails = [...filterEmails(starredEmails, search)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  // Remove star
  const handleUnstar = async (event, id) => {
    event.stopPropagation();

    try {
      await fetch(`http://localhost:3000/emails/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          starred: false,
        }),
      });

      // Update Home emails state
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === id
            ? {
                ...email,
                starred: false,
              }
            : email
        )
      );
    } catch (error) {
      console.error("Unable to remove star", error);
    }
  };

  return (
    <div className="inbox-container">
      <div className="email-list">

        {filteredEmails.length === 0 ? (
          <p className="no-email">
           {search.trim() ? `no search found ${search} in starred dmail`
              : "No starred dmail is present" 
          }
          </p>
        ) : (
          filteredEmails.map((email) => (
            <div
              className="email-row"
              key={email.id}
              onClick={() =>
                openSelectedMail(email.id)
              }>
              <Checkbox
                onClick={(event) =>
                  event.stopPropagation()
                }
              />

              {/* Gold Star */}
              <IconButton
                onClick={(event) =>
                  handleUnstar(event, email.id)
                }
              >
                <StarIcon className="star-active" />
              </IconButton>

              {/* Sender / Receiver */}
              <div className="email-sender">
                {email.from === loggedInUser.email
                  ? email.to
                  : email.from}
              </div>

              {/* Subject + Message */}
              <div className="email-content">
                <span className="email-subject">
                  {email.subject}
                </span>

                <span className="email-preview">
                  {" - " + email.message}
                </span>
              </div>

              {/* Date */}
              <div className="email-date">
                {email.date || "Today"}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default StarredEmails;