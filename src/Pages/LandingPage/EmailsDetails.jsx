import { useContext, useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useLocation,
} from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { deleteEmail, moveEmailToSpam,archiveEmail,
  permanentlyDeleteEmail,
} from "../../authApi/emailsApi";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArchiveIcon from "@mui/icons-material/Archive";
import ReportIcon from "@mui/icons-material/Report";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SnoozeIcon from "@mui/icons-material/Snooze";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardIcon from "@mui/icons-material/Forward";
import ReplyEmail from "./ReplyEmail";
import { restoreArchivedEmail } from "../../authApi/restoreEmail";
import ForwardEmail from "./ForwardEmail";
import "./EmailsDetails.css";
import { unsnoozeEmail } from "../../authApi/UnSnoozeEmail";
const EmailsDetails = () => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const { emails, setEmails } = useOutletContext();
  const { id } = useParams();
  const location = useLocation();
  const folder = location.state?.folder || "inbox";
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  // Find selected email
  const email = emails.find((email) => String(email.id) === String(id));
    // If email not found
  if (!email) {
    return <p className="no-email">No email is found</p>;
  }
 const threadId = email.threadId || email.id;

const conversationEmails = emails
  .filter((item) => {
    const itemThreadId = item.threadId || item.id;

    return String(itemThreadId) === String(threadId);
  })
  .sort((a, b) => {
    return (
      new Date(a.createdAt || a.date) -
      new Date(b.createdAt || b.date)
    );
  });

  // control the snoozing
  const isSnoozed =
    ((folder === "inbox" || folder === "spam") &&
      email.receiverSnoozedUntil &&
      new Date(email.receiverSnoozedUntil) > new Date()) ||
    ((folder === "sent" || folder === "draft") &&
      email.senderSnoozedUntil &&
      new Date(email.senderSnoozedUntil) > new Date());
  // Back button
  const handleBack = () => {
    navigate(-1);
  };
  const handleUnsnooze = async () => {
    try {
      await unsnoozeEmail(email.id, folder);

      setEmails((prevEmails) =>
        prevEmails.map((item) => {
          if (item.id !== email.id) {
            return item;
          }
          // Inbox / Spam
          if (folder === "inbox" || folder === "spam") {
            return {
              ...item,
              receiverSnoozedUntil: null,
            };
          }
          // Sent / Draft
          if (folder === "sent" || folder === "draft") {
            return {
              ...item,
              senderSnoozedUntil: null,
            };
          }
          return item;
        }),
      );
      // Go back to the same folder
      if (folder === "inbox") {
        navigate("/inbox");
      }
      if (folder === "spam") {
        navigate("/spam");
      }
      if (folder === "sent") {
        navigate("/sent");
      }
      if (folder === "draft") {
        navigate("/draft");
      }
    } catch (error) {
      console.error("Unable to unsnooze email", error);
    }
  };
  // Delete email
  const handleDelete = async () => {
    try {
      // Trash → permanently delete
   if (folder === "trash") {
  await permanentlyDeleteEmail(email.id);

  setEmails((prevEmails) =>
    prevEmails.filter((item) => item.id !== email.id)
  );

  navigate(-1);
  return;
}
      // Inbox / Sent / Spam → Trash
      await deleteEmail(email.id, folder);
      setEmails((prevEmails) =>
        prevEmails.map((item) => {
          if (item.id !== email.id) {
            return item;
          }

          // Received email
          if (folder === "inbox" || folder === "spam") {
            return {
              ...item,
              receiverFolder: "trash",
            };
          }

          // Sent email
          if (folder === "sent") {
            return {
              ...item,
              senderFolder: "trash",
            };
          }

          return item;
        }),
      );

      navigate(-1);
    } catch (error) {
      console.error("Unable to delete email", error);
    }
  };

  const handleArchive = async () => {
    try {
      const originalFolder = folder;

      if (
        originalFolder !== "inbox" &&
        originalFolder !== "spam" &&
        originalFolder !== "sent" &&
        originalFolder !== "starred-received" &&
        originalFolder !== "starred-sent"
      ) {
        console.error(`Cannot archive email from folder: ${originalFolder}`);
        return;
      }

      const archivedEmail = await archiveEmail(email.id, originalFolder);

      setEmails((prevEmails) =>
        prevEmails.map((item) => (item.id === email.id ? archivedEmail : item)),
      );

      navigate(-1);
    } catch (error) {
      console.error("Unable to archive email", error);
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
            : item,
        ),
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
          <IconButton onClick={handleArchive}>
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

    <div className="email-details-content">

     <div className="email-subject-row">

  <h1 className="email-details-subject">
    {email.subject}
  </h1>

  <span className="email-folder-label">
    {folder === "inbox" && "Inbox"}
    {folder === "sent" && "Sent"}
    {folder === "spam" && "Spam"}
    {folder === "trash" && "Trash"}
    {folder === "draft" && "Draft"}
    {folder === "starred-received" && "Starred"}
    {folder === "starred-sent" && "Starred"}
  </span>

</div>

      {isSnoozed && (
        <div className="snooze-info">
          <SnoozeIcon fontSize="small" />
          <span>
            Snoozed until{" "}
            {new Date(
              folder === "inbox" || folder === "spam"
                ? email.receiverSnoozedUntil
                : email.senderSnoozedUntil
            ).toLocaleString()}
          </span>

          <button onClick={handleUnsnooze}>
            Unsnooze
          </button>

        </div>
      )}

      <div className="conversation-container">

        {conversationEmails.map((conversationEmail) => (

          <div
            className="conversation-email"
            key={conversationEmail.id}
          >

            {/* Header */}
            <div className="email-details-header">

              <div className="email-avatar">
                {conversationEmail.from
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="email-sender-info">

                <div className="sender-name">
                  {conversationEmail.from}
                </div>

                <div className="receiver-info">
                  to {conversationEmail.to}
                </div>

              </div>

              <div className="email-details-date">
                {conversationEmail.date || "Today"}
              </div>

            </div>

            <div className="email-message">
              {conversationEmail.message}
            </div>

            {conversationEmail.attachment && (

              <div className="email-attachment">

                <img
                  className="email-attchment-image"
                  src={conversationEmail.attachment.data}
                  alt={conversationEmail.attachment.name}
                />

                <div className="email-attachment-name">
                  {conversationEmail.attachment.name}
                </div>

              </div>

            )}

          </div>

        ))}

      </div>

      <div className="email-actions">

        <button
          className="email-action-btn"
          onClick={() => setReplyOpen(true)}
        >
          <ReplyIcon />
          Reply
        </button>

        <button
          className="email-action-btn"
          onClick={() => setForwardOpen(true)}
        >
          <ForwardIcon />
          Forward
        </button>

      </div>


      {/* Reply */}
      {replyOpen && (
        <ReplyEmail
          email={email}
          loggedInUser={loggedInUser}
          onClose={() => setReplyOpen(false)}
        />
      )}


      {/* Forward */}
      {forwardOpen && (
        <ForwardEmail
          email={email}
          loggedInUser={loggedInUser}
          onClose={() => setForwardOpen(false)}
        />
      )}

    </div>

  </div>
);
};
export default EmailsDetails;
