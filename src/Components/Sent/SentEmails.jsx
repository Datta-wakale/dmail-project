import { useContext } from "react";
import { useOutletContext } from "react-router-dom"
import { UserContext } from "../../Context/UserContext";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteEmail, toggleStarEmail } from "../../authApi/emailsApi";
import StarIcon from "@mui/icons-material/Star";

const SentEmails = () => {
    const { emails, setEmails, openSelectedMail, search, filterEmails } = useOutletContext();
    const { loggedInUser } = useContext(UserContext);

    // get only sent mail
    const sentEmails = emails.filter((email) => email.from === loggedInUser.email && email.senderFolder === "sent");
    const handleDelete = async (event, id) => {
        event.stopPropagation();
        await deleteEmail(id, "sent");
        setEmails((prevEmails) =>
            prevEmails.map((email) =>
                email.id === id
                    ? {
                        ...email,
                        senderFolder: "trash"
                    }
                    : email
            )
        );
    };
    const filteredEmails = [...filterEmails(sentEmails, search)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
            console.log("unable to add in star", error);
        }
    };

    return (
        <div className="sent-container">
            <div className="email-list">
                {filteredEmails.length === 0 ? (
                    <p className="no-email">
                        {search.trim()
                            ? `No dmails found for "${search}"`
                            : "No sent dmails available"}
                    </p>)
                    : (
                        filteredEmails.map((email) => (
                            <div className="email-row" onClick={() => openSelectedMail(email.id, "sent")}
                                key={email.id}>
                                <Checkbox onClick={(event) =>
                                    event.stopPropagation()} />
                                <IconButton
                                    onClick={(event) => handleStar(event, email)} >
                                    {email.starred ? (
                                        <StarIcon className="star-active" />
                                    ) : (
                                        <StarBorderIcon />
                                    )}
                                </IconButton>
                                <div className="email-sender">
                                    {email.to}
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
    )
}
export default SentEmails;