import { useContext } from "react";
import { useNavigate, useOutletContext, useParams, useLocation } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { deleteEmail,moveEmailToSpam } from "../../authApi/emailsApi";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArchiveIcon from "@mui/icons-material/Archive";
import ReportIcon from "@mui/icons-material/Report";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardIcon from "@mui/icons-material/Forward";
import "./EmailsDetails.css";

const EmailsDetails = () => {
  const { emails, setEmails } = useOutletContext();
  const { id } = useParams();
  const location = useLocation();
  const folder = location.state?.folder || "inbox";
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  // Find selected email
  const email = emails.find(
    (email) => String(email.id) === String(id));

  //If email not found
  if (!email){
    return (
      <p className="no-email">  No email is found </p>
    );
  }
  // Back button
  const handleBack = () => {
    navigate(-1);
  };
  // Delete email
  const handleDelete = async () => {
    try {
      await deleteEmail(email.id, folder);
      // Update emails state
      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? {
              ...item,
              ...(folder === "inbox" && {
                receiverFolder: "trash",
              }),
              ...(folder === "sent" && {
                senderFolder: "trash",
              }),
            }
            : item
        )
      );
      // Go back
      navigate(-1);
    } catch (error) {
      console.error("Unable to delete email", error);
    }
  };
  const handleReportSpam = async () => {
    try {
      await moveEmailToSpam(email.id);

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? {
              ...item,
              receiverFolder: "spam",
            }
            : item
        )
      );

      navigate(-1);
    } catch (error) {
      console.error("Unable to report email as spam", error);
    }
  };
  return (
    <div className="email-details-container">
      <div className="email-details-toolbar">
        <Tooltip title="Back">
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <div className="toolbar-right">
          <Tooltip title="Archive">
            <IconButton>
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Report spam">
            <IconButton onClick={handleReportSpam}>
              <ReportIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark as unread">
            <IconButton>
              <MarkEmailUnreadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      {/* Email content */}
      <div className="email-details-content">

        <h1 className="email-details-subject">
          {email.subject}
        </h1>
        <div className="email-details-header">

          <div className="email-avatar">
            {email.from?.charAt(0).toUpperCase()}
          </div>
          <div className="email-sender-info">
            <div className="sender-name"> {email.from}</div>
            <div className="receiver-info">  to {email.to} </div>
          </div>
          <div className="email-details-date">
            {email.date || "Today"}
          </div>
        </div>
        <div className="email-message">
          {email.message}
        </div>
        {email.attachment && 
            <div className="email-attachment">
                <img className="email-attchment-image" src={email.attachment.data} alt={email.attachment.name} />
                 <div className="email-attachment-name">
                      {email.attachment.name}
                  </div> 
            </div>
        
        }
        <div className="email-actions">
          <button className="email-action-btn">
            <ReplyIcon />  Reply </button>
          <button className="email-action-btn">
            <ForwardIcon /> Forward </button>
        </div>
      </div>
    </div>
  );
};

export default EmailsDetails;