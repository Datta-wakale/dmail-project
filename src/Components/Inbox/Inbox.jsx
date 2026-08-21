import { useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { deleteEmail, toggleStarEmail } from "../../authApi/emailsApi";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import "./Inbox.css";

const Inbox = () => {

    const { loggedInUser } = useContext(UserContext);

    // Get emails state from Home
    const { emails, setEmails, openSelectedMail ,search,filterEmails} = useOutletContext();
    const navigate = useNavigate();
    // Only received emails
    const receivedEmails = emails.filter(
        (email) =>
            email.to === loggedInUser.email &&
            email.receiverFolder === "inbox"
    );
    const filteredEmails = [...filterEmails(receivedEmails, search)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // Delete email
    const handleDelete = async (event, id) => {
        event.stopPropagation();
        await deleteEmail(id, "inbox");
        // Update Home's emails state
        setEmails((prevEmails) =>
            prevEmails.map((email) =>
                email.id === id
                    ? {
                        ...email,
                        receiverFolder: "trash"
                    }
                    : email
            )
        );
    };


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
            console.error("Unable to update star", error);
        }
    };
    return (
        <div className="inbox-container">
            <div className="email-list">
                {filteredEmails.length === 0 ? (
                    <p className="no-email">
                       {search.trim() ? `no dmails found for ${search}`
                       : `No dmails is present in your inbox`
                    }
                    </p>
                ) : (
                    filteredEmails.map((email) => (
                        <div className="email-row" onClick={() => openSelectedMail(email.id, "inbox")}
                            key={email.id} >
                            <Checkbox onClick={(event) =>
                                event.stopPropagation()
                            } />
                            <IconButton
                                onClick={(event) => handleStar(event, email)}
                            >
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
                                onClick={(event) => handleDelete(event, email.id)} >
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default Inbox;