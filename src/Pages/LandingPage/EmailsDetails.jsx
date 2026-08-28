import { useContext, useState, useEffect } from "react";
import { useNavigate, useOutletContext, useParams, useLocation, } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { deleteEmail, moveEmailToSpam, archiveEmail, permanentlyDeleteEmail, } from "../../authApi/emailsApi";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArchiveIcon from "@mui/icons-material/Archive";
import ReportIcon from "@mui/icons-material/Report";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SnoozeIcon from "@mui/icons-material/Snooze";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardIcon from "@mui/icons-material/Forward";
import ReplyEmail from "./ReplyEmail";
import ForwardEmail from "./ForwardEmail";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "./EmailsDetails.css";
import MoveToMenu from "../../Components/MoveTo/MoveTo";
import { unsnoozeEmail } from "../../authApi/UnSnoozeEmail";
import { updateEmail } from "../../authApi/updateEmail";

const EmailsDetails = () => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const moreOpen = Boolean(moreAnchorEl);
  const { emails, setEmails, loadEmails } = useOutletContext();
  const { id } = useParams();
  const location = useLocation();
  const folder = location.state?.folder || "inbox";
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  // Find selected email

  const email = emails.find((email) => String(email.id) === String(id));
  useEffect(() => {
    const markAsRead = async () => {
      if (!email || email.read) {
        return;
      }
      try {
        await updateEmail(email.id, {
          ...email,
          read: true,
        });

        setEmails((prevEmails) =>
          prevEmails.map((item) =>
            item.id === email.id
              ? { ...item, read: true }
              : item
          )
        );
      } catch (error) {
        console.error("Unable to mark email as read", error);
      }
    };
    markAsRead();
  }, [email?.id]);
  // If email not found
  if (!email) {
    return <p className="no-email">No email is found</p>;
  }
  const threadId = email.threadId || email.id;
  console.log("ORIGINAL THREAD ID:", threadId);
  const conversationEmails = emails
    .filter((item) => {
      const itemThreadId = item.threadId || item.id;
       console.log("ITEM:", item.id, "THREAD:", itemThreadId,"MATCH:",
      String(itemThreadId) === String(threadId) );

      return String(itemThreadId) === String(threadId);
    })
    .sort((a, b) => {
      return (
        new Date(a.createdAt || a.date) -
        new Date(b.createdAt || b.date)
      );
    });
console.log( "conversations Emails:",conversationEmails);
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
          prevEmails.filter((item) => item.id !== email.id));
        navigate(-1);
        return;
      }
      // Inbox / Sent / Spam  Trash
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
      const spamEmail = await moveEmailToSpam(email.id, folder);

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? spamEmail
            : item
        )
      );

      navigate(-1);
    } catch (error) {
      console.error("Unable to report email as spam", error);
    }
  };
  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const handleReplyFromMenu = () => {
    setMoreAnchorEl(null);
    setReplyOpen(true);
  };

  const handleForwardFromMenu = () => {
    setMoreAnchorEl(null);
    setForwardOpen(true);
  };
  const handleMarkAsRead = async () => {
    try {
      await updateEmail(email.id, {
        ...email,
        read: true,
      });

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? { ...item, read: true }
            : item
        )
      );
      setMoreAnchorEl(null);
    } catch (error) {
      console.error("Unable to mark email as read", error);
    }
  };
  const handleMarkAsUnread = async () => {
    try {
      await updateEmail(email.id, {
        ...email,
        read: false,
      });

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? { ...item, read: false }
            : item
        )
      );
    } catch (error) {
      console.error("Unable to mark email as unread", error);
    }
  };
  const getTrashType = (email) => {
    if (email.to === loggedInUser.email && email.receiverFolder === "trash") {
      return "receiver";
    }
    if (email.from === loggedInUser.email && email.senderFolder === "trash") {
      return "sender";
    }
    return null;
  };
  return (
    <div className="email-details-container">
      <div className="email-details-toolbar">
        <div className="toolbar-left">
          <Tooltip title="Back">
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <MoveToMenu
            email={email}
            folder={folder}
            trashType={getTrashType(email)}
            loggedInUser={loggedInUser}
            onMove={(updatedEmail, toFolder) => {

              setEmails((prevEmails) =>
                prevEmails.map((item) =>
                  String(item.id) === String(updatedEmail.id)
                    ? updatedEmail
                    : item
                )
              );

              if (folder === "trash") {
                navigate(`/${toFolder}`);
              } else {
                navigate(-1);
              }
            }}
          />





        </div>

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

          <Tooltip title={email.read ? "Mark as unread" : "Mark as read"}>
            <IconButton
              onClick={email.read ? handleMarkAsUnread : handleMarkAsRead} >
              {email.read ? (
                <MarkEmailUnreadIcon />
              ) : (
                <MarkEmailReadIcon />
              )}
            </IconButton>
          </Tooltip>


          <Tooltip title="More">
            <IconButton onClick={handleMoreClick}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={moreAnchorEl}
            open={moreOpen}
            onClose={handleMoreClose}
          >
            <MenuItem onClick={handleMarkAsRead}>
              Mark as read
            </MenuItem>
            <MenuItem onClick={handleReplyFromMenu} disabled={folder === "trash"}>
              Reply
            </MenuItem>
            <MenuItem onClick={handleForwardFromMenu} disabled={folder === "trash"}>
              Forward
            </MenuItem>
            <MenuItem onClick={() => {
              handleMoreClose();
              handleDelete();
            }}>
              Delete
            </MenuItem>

          </Menu>
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
            <div className="conversation-email"
              key={conversationEmail.id} >
              <div className="email-details-header">
                <div className="email-avatar">
                  {conversationEmail.from
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
                <div className="email-sender-info">
                  <div className="sender-name">
                    {conversationEmail.from === loggedInUser.email
                      ? "me" : conversationEmail.from}
                  </div>
                  <div className="receiver-info">
                    to{" "}
                    {conversationEmail.to === loggedInUser.email
                      ? "me"
                      : conversationEmail.to}
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
                    alt={conversationEmail.attachment.name} />
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
            className="email-action-btn" disabled={folder === "trash"}
            onClick={() => setReplyOpen(true)}>
            <ReplyIcon />
            Reply
          </button>
          <button className="email-action-btn" disabled={folder === "trash"}
            onClick={() => setForwardOpen(true)}>
            <ForwardIcon />
            Forward
          </button>
        </div>
        {replyOpen && (
          // <ReplyEmail
          //   email={email}
          //   loggedInUser={loggedInUser}
          //   onClose={() => setReplyOpen(false)}
          //   onReplySent={(newReply) => {
          //     setEmails((prevEmails) => {
          //       const updatedEmails = [...prevEmails, newReply];
          //       console.log("UPDATED EMAILS:: 482", updatedEmails);
          //       return updatedEmails;
          //     });
          //   }}

         <ReplyEmail
  email={email}
  loggedInUser={loggedInUser}
  onClose={() => setReplyOpen(false)}
  onReplySent={(newReply) => {
    if (!newReply?.id) {
      console.error("Invalid reply received:", newReply);
      return;
    }

    setEmails((prevEmails) => {
      const exists = prevEmails.some(
        (item) => String(item.id) === String(newReply.id)
      );

      if (exists) {
        return prevEmails;
      }

      return [...prevEmails, newReply];
    });
  }}
/>

        )}
        {/* Forward */}
        {forwardOpen && (
          <ForwardEmail
            email={email}
            loggedInUser={loggedInUser}
            onClose={() => setForwardOpen(false)} />
        )}
      </div>
    </div>
  );
};
export default EmailsDetails;
