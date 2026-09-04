import { useContext, useState, useEffect } from "react";
import { useNavigate, useOutletContext, useParams, useLocation, } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../../Context/UserContext";
import { deleteEmail, moveEmailToSpam, archiveEmail, permanentlyDeleteEmail, snoozeEmail, toggleStarEmail } from "../../authApi/emailsApi";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import ReportIcon from "@mui/icons-material/Report";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SnoozeIcon from "@mui/icons-material/Snooze";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardIcon from "@mui/icons-material/Forward";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ReplyEmail from "./ReplyEmail";
import ForwardEmail from "./ForwardEmail";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "./EmailsDetails.css";
import MoveToMenu from "../../Components/MoveTo/MoveTo";
import { unsnoozeEmail } from "../../authApi/UnSnoozeEmail";
import { updateEmail } from "../../authApi/updateEmail";
import SnoozeDialog from "../../Components/SnoozeDialoge/SnoozeDialog";
import { canUseReplyOrForward, formatMailDate, getReceiverDisplayLabel, getSenderDisplayLabel, isEmailForUser, matchesAnyRecipient, normalizeEmailAddress } from "../../Utils/mailUtils";
import { restoreSpamEmail } from "../../authApi/restoreEmail";
import { restoreArchivedEmail } from "../../authApi/restoreEmail";
const EmailsDetails = () => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [forwardTarget, setForwardTarget] = useState(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [messageMenu, setMessageMenu] = useState(null);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const moreOpen = Boolean(moreAnchorEl);
  const { emails, setEmails, showSnackbar } = useOutletContext();
  const { id } = useParams();
  const location = useLocation();
  const folder = location.state?.folder || "inbox";
  const { loggedInUser } = useContext(UserContext);
  const navigate = useNavigate();
  const notify = showSnackbar || ((message) => toast.info(message));
  const undoUpdate = (snapshot, message) => notify(message, async () => {
    try {
      const restored = await updateEmail(snapshot.id, snapshot);
      setEmails((items) => items.map((item) => item.id === restored.id ? restored : item));
    } catch (error) {
      toast.error("Unable to undo action");
    }
  });
  // Find selected email
  const email = emails.find((email) => String(email.id) === String(id));
  useEffect(() => {
    if (!email || email.read) {
      return;
    }

    const markAsRead = async () => {
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
  }, [email, setEmails]);
  // If email not found
  if (!email) {
    return <p className="no-email">No email is found</p>;
  }
  const threadId = email.threadId || email.id;
  const isMessageInCurrentFolder = (item) => {
    const isReceivedByUser = matchesAnyRecipient(item.to, loggedInUser?.email);
    const isSentByUser = isEmailForUser(item.from, loggedInUser);

    if (folder === "trash") {
      return (isReceivedByUser && item.receiverFolder === "trash") ||
        (isSentByUser && item.senderFolder === "trash");
    }

    if (folder === "sent" || folder === "inbox" || folder === "spam") {
      return !((isReceivedByUser && item.receiverFolder === "trash") ||
        (isSentByUser && item.senderFolder === "trash"));
    }

    return true;
  };

  const conversationEmails = emails
    .filter((item) => {
      const itemThreadId = item.threadId || item.id;
      return String(itemThreadId) === String(threadId) &&
        isMessageInCurrentFolder(item);
    })
    .sort((a, b) => {
      return (
        new Date(a.createdAt || a.date) -
        new Date(b.createdAt || b.date)
      );
    });
  // control the snoozing
  const snoozedUntil = folder === "archive"
    ? (email.receiverFolder === "archive"
      ? email.receiverSnoozedUntil
      : email.senderSnoozedUntil)
    : (folder === "inbox" || folder === "spam"
      ? email.receiverSnoozedUntil
      : email.senderSnoozedUntil);

  const isSnoozed = Boolean(snoozedUntil) && new Date(snoozedUntil) > new Date();
  // Back button
  const handleBack = () => {
    navigate(-1);
  };
  const handleUnsnooze = async () => {
    try {
      const previous = { ...email };
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
          if (folder === "archive") {
            if (item.receiverFolder === "archive") {
              return {
                ...item,
                receiverSnoozedUntil: null,
              };
            }
            if (item.senderFolder === "archive") {
              return {
                ...item,
                senderSnoozedUntil: null,
              };
            }
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
        navigate("/drafts");
      }
      if (folder === "archive") {
        navigate("/archive");
      }
      notify("Email unsnoozed", async () => {
        const restored = await updateEmail(previous.id, previous);
        setEmails((items) => items.map((item) => item.id === restored.id ? restored : item));
      });
    } catch (error) {
      console.error("Unable to unsnooze email", error);
    }
  };
  // Delete email
  const handleDelete = async () => {
    try {
      const previous = { ...email };
      // Trash → permanently delete
      if (folder === "trash") {
        await permanentlyDeleteEmail(email.id);

        setEmails((prevEmails) =>
          prevEmails.filter((item) => item.id !== email.id));
        notify("Email permanently deleted");
        navigate(-1);
        return;
      }
      // Inbox / Sent / Spam / Archive  Trash
      await deleteEmail(email.id, folder);
      setEmails((prevEmails) =>
        prevEmails.map((item) => {
          if (item.id !== email.id) {
            return item;
          }
          // Received email
         if (folder === "inbox") {
  return {
    ...item,
    receiverFolder: "trash",
  };
}

// Spam
if (folder === "spam") {
  if (item.receiverFolder === "spam") {
    return {
      ...item,
      receiverFolder: "trash",
    };
  }

  if (item.senderFolder === "spam") {
    return {
      ...item,
      senderFolder: "trash",
    };
  }
}

          // Sent email
          if (folder === "sent") {
            return {
              ...item,
              senderFolder: "trash",
            };
          }

          if (folder === "archive") {
            if (item.receiverFolder === "archive") {
              return {
                ...item,
                receiverFolder: "trash",
              };
            }
            if (item.senderFolder === "archive") {
              return {
                ...item,
                senderFolder: "trash",
              };
            }
          }
          return item;
        }),
      );

      navigate(-1);
      undoUpdate(previous, "Email moved to Trash");
    } catch (error) {
      console.error("Unable to delete email", error);
    }
  };

  const handleArchive = async () => {
    try {
      const previous = { ...email };
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
      undoUpdate(previous, "Email archived");
    } catch (error) {
      console.error("Unable to archive email", error);
    }
  };
  const handleUnarchive = async () => {
    try {
      const previous = { ...email };

      const restoreFolder =
        email.from === loggedInUser?.email
          ? "sent"
          : "inbox";

      const restoredEmail = await restoreArchivedEmail(
        email.id,
        restoreFolder
      );

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? restoredEmail
            : item
        )
      );

      navigate(`/${restoreFolder}`);

      notify(
        `Email moved to ${restoreFolder === "sent" ? "Sent" : "Inbox"
        }`,
        async () => {
          try {
            const restored = await updateEmail(
              previous.id,
              previous
            );

            setEmails((items) =>
              items.map((item) =>
                item.id === restored.id
                  ? restored
                  : item
              )
            );
          } catch (error) {
            console.error(
              "Unable to undo unarchive:",
              error
            );
          }
        }
      );
    } catch (error) {
      console.error(
        "Unable to unarchive email:",
        error
      );
    }
  };
  const handleReportSpam = async () => {
    try {
      const previous = { ...email };
      const spamEmail = await moveEmailToSpam(email.id, folder);

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? spamEmail
            : item
        )
      );

      navigate(-1);
      undoUpdate(previous, "Email moved to Spam");
    } catch (error) {
      console.error("Unable to report email as spam", error);
    }
  };

  // not a spam 
  const handleNotSpam = async () => {
    try {
        if (folder !== "spam") {
        return;
      }
      const previous = { ...email };
      const updatedEmail = await restoreSpamEmail(email.id);

      setEmails((prevEmails) =>
        prevEmails.map((item) =>
          item.id === email.id
            ? updatedEmail
            : item
        )
      );
      // determine the destination folder based on the previous folder of the email ( inbox / sent) 
      const destinationFolder =
        previous.receiverFolder === "spam"
          ? "inbox"
          : "sent";

      // Go back to Inbox or Sent
      navigate(`/${destinationFolder}`);
      notify(
        `Email moved to ${destinationFolder === "inbox" ? "Inbox" : "Sent"}`,
        async () => {
          try {
            // detect the mail and restore
            const restoredSpamEmail = await moveEmailToSpam( previous.id, destinationFolder);
            // update the emails with restored state 
            setEmails((items) =>
              items.map((item) =>
                item.id === restoredSpamEmail.id
                  ? restoredSpamEmail
                  : item
              )
            );
          } catch (error) {
            console.error("Unable to undo Not Spam:", error);
            toast.error("Unable to undo action");
          }
        }
      );
    } catch (error) {
      console.error("Unable to move email from Spam:", error);
      toast.error("Unable to move email from Spam");
    }
  };
  const handleMoreClick = (event) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const handleReplyFromMenu = () => {
    if (!loggedInUser?.email) {
      toast.error("Please sign in to reply to email.");
      return;
    }

    if (!canUseReplyOrForward(email, loggedInUser.email)) {
      setMoreAnchorEl(null);
      notify("This email is in Trash. Move it to Inbox to reply.");
      return;
    }
    setMoreAnchorEl(null);
    setReplyTarget(email);
    setReplyOpen(true);
  };

  const handleForwardFromMenu = () => {
    if (!loggedInUser?.email) {
      toast.error("Please sign in to forward email.");
      return;
    }

    if (!canUseReplyOrForward(email, loggedInUser.email)) {
      setMoreAnchorEl(null);
      notify("This email is in Trash. Move it to Inbox to forward.");
      return;
    }
    setMoreAnchorEl(null);
    setForwardTarget(email);
    setForwardOpen(true);
  };
  const handleMarkAsRead = async () => {
    try {
      const previous = { ...email };
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
      notify("Email marked as read", () => updateEmail(previous.id, previous).then((restored) =>
        setEmails((items) => items.map((item) => item.id === restored.id ? restored : item))));
    } catch (error) {
      console.error("Unable to mark email as read", error);
    }
  };
  const handleMarkAsUnread = async () => {
    try {
      const previous = { ...email };
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
      notify("Email marked as unread", () => updateEmail(previous.id, previous).then((restored) =>
        setEmails((items) => items.map((item) => item.id === restored.id ? restored : item))));
    } catch (error) {
      console.error("Unable to mark email as unread", error);
    }
  };
  const getTrashType = (email) => {
    if (matchesAnyRecipient(email.to, loggedInUser.email) && email.receiverFolder === "trash") {
      return "receiver";
    }
    if (isEmailForUser(email.from, loggedInUser) && email.senderFolder === "trash") {
      return "sender";
    }
    return null;
  };

  const handleReplyClick = () => {
    if (!canUseReplyOrForward(email, loggedInUser.email)) {
      notify("This email is in Trash. Move it to Inbox to reply.");
      return;
    }

    setReplyTarget(email);
    setReplyOpen(true);
  };

  const handleForwardClick = () => {
    if (!canUseReplyOrForward(email, loggedInUser.email)) {
      notify("This email is in Trash. Move it to Inbox to forward.");
      return;
    }

    setForwardTarget(email);
    setForwardOpen(true);
  };

  const handleSnooze = async (snoozedUntil) => {
    const previous = { ...email };
    try {
     const effectiveFolder = folder === "starred-received"
        ? "inbox" : folder === "starred-sent"
      ? "sent"
      : folder;

      const updated = await snoozeEmail(email.id, effectiveFolder, snoozedUntil);
      setEmails((items) => items.map((item) => item.id === email.id ? updated : item));
      setSnoozeOpen(false);
      notify("Email snoozed", async () => {
        const restored = await updateEmail(previous.id, previous);
        setEmails((items) => items.map((item) => item.id === restored.id ? restored : item));
      });
      navigate(folder === "archive" ? "/archive" : -1);
    } catch (error) {
      toast.error("Unable to snooze email");
    }
  };

  const handleStar = async (item) => {
    try {
      const updated = await toggleStarEmail(item.id, !item.starred);
      setEmails((items) => items.map((mail) => mail.id === item.id ? updated : mail));
    } catch (error) {
      toast.error("Unable to update star");
    }
  };

  const handleMessageAction = async (action, item) => {
    setMessageMenu(null);
    if (action === "reply") {
      if (!canUseReplyOrForward(item, loggedInUser?.email)) return notify("This email is in Trash. Move it to Inbox to reply.");
      setReplyTarget(item);
      setReplyOpen(true);
    } else if (action === "forward") {
      if (!canUseReplyOrForward(item, loggedInUser?.email)) return notify("This email is in Trash. Move it to Inbox to forward.");
      setForwardTarget(item);
      setForwardOpen(true);
    } else if (action === "unread" || action === "read") {
      const previous = { ...item };
      const updated = await updateEmail(item.id, { ...item, read: action === "read" });
      setEmails((items) => items.map((mail) => mail.id === item.id ? updated : mail));
      notify(action === "read" ? "Email marked as read" : "Email marked as unread", async () => {
        const restored = await updateEmail(previous.id, previous);
        setEmails((items) => items.map((mail) => mail.id === restored.id ? restored : mail));
      });
    } else if (action === "delete") {
      const previous = { ...item };
      const itemFolder = normalizeEmailAddress(item.from) === normalizeEmailAddress(loggedInUser?.email)
        ? "sent"
        : "inbox";
      const updated = await deleteEmail(item.id, itemFolder);
      setEmails((items) => items.map((mail) => mail.id === item.id ? updated : mail));
      undoUpdate(previous, "Email moved to Trash");
    }
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
              const previous = { ...email };

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
              notify(`Email moved to ${toFolder}`, async () => {
                const restored = await updateEmail(previous.id, previous);
                setEmails((items) => items.map((item) => item.id === restored.id ? restored : item));
              });
            }}
          />
        </div>

        <div className="toolbar-right">
          {folder === "archive" ? (
            <Tooltip title="Unarchive">
              <IconButton onClick={handleUnarchive}>
                <UnarchiveIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Archive">
              <IconButton onClick={handleArchive}>
                <ArchiveIcon />
              </IconButton>
            </Tooltip>
          )}
        
        { folder !== "spam" &&
             <Tooltip title="Report spam">
            <IconButton onClick={handleReportSpam}>
              <ReportIcon />
            </IconButton>
          </Tooltip>
        } 

          <Tooltip title="Delete">
            <IconButton onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Snooze">
            <IconButton onClick={() => setSnoozeOpen(true)}>
              <SnoozeIcon />
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
          <Menu anchorEl={moreAnchorEl}
            open={moreOpen}
            onClose={handleMoreClose} >
            <MenuItem onClick={handleMarkAsRead}>
              Mark as read
            </MenuItem>
            <MenuItem onClick={handleReplyFromMenu}>
              Reply
            </MenuItem>
            <MenuItem onClick={handleForwardFromMenu}>
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
      {/* not a spam button */}
      {folder === "spam" && (
        <div className="not-spam-container">
          <button
            className="not-spam-button"
            onClick={handleNotSpam}
          >
            Not spam
          </button>
        </div>
      )}
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
            {folder === "archive" && "Archive"}
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
                folder === "archive"
                  ? (email.receiverFolder === "archive"
                    ? email.receiverSnoozedUntil
                    : email.senderSnoozedUntil)
                  : (folder === "inbox" || folder === "spam"
                    ? email.receiverSnoozedUntil
                    : email.senderSnoozedUntil)
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
                    {getSenderDisplayLabel(conversationEmail, loggedInUser.email)}
                  </div>
                  <div className="receiver-info">
                    to {getReceiverDisplayLabel(conversationEmail, loggedInUser.email)}
                  </div>
                </div>
                <div className="email-details-date">
                  {formatMailDate(conversationEmail.createdAt || conversationEmail.date)}
                  <IconButton size="small"
                    aria-label={conversationEmail.starred ? "Unstar email" : "Star email"}
                    onClick={() => handleStar(conversationEmail)}
                  >
                    {conversationEmail.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton size="small" aria-label="More actions"
                    onClick={(event) => setMessageMenu({ anchorEl: event.currentTarget, email: conversationEmail })}>
                    <MoreVertIcon />
                  </IconButton>
                </div>
              </div>
              <div className="email-message">
                {conversationEmail.message}
              </div>
              {conversationEmail.attachment && (
                <div className="email-attachment">
                  {conversationEmail.attachment.type?.startsWith("image/") ? (
                    <img className="email-attchment-image"
                      src={conversationEmail.attachment.data}
                      alt={conversationEmail.attachment.name} />
                  ) : <AttachFileIcon />}
                  <div className="email-attachment-name">
                    <a href={conversationEmail.attachment.data}
                      download={conversationEmail.attachment.name}>
                      {conversationEmail.attachment.name}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <Menu anchorEl={messageMenu?.anchorEl}
          open={Boolean(messageMenu)}
          onClose={() => setMessageMenu(null)} >
          {messageMenu?.email && <>
            <MenuItem onClick={() => handleMessageAction("reply", messageMenu.email)}>Reply</MenuItem>
            <MenuItem onClick={() => handleMessageAction("forward", messageMenu.email)}>Forward</MenuItem>
            <MenuItem onClick={() => handleMessageAction("delete", messageMenu.email)}>Delete</MenuItem>
            <MenuItem onClick={() => handleMessageAction(messageMenu.email.read ? "unread" : "read", messageMenu.email)}>
              Mark as {messageMenu.email.read ? "unread" : "read"}
            </MenuItem>
          </>}
        </Menu>
        <div className="email-actions">
          <button
            className="email-action-btn"
            onClick={handleReplyClick}>
            <ReplyIcon />
            Reply
          </button>
          <button
            className="email-action-btn"
            onClick={handleForwardClick}>
            <ForwardIcon />
            Forward
          </button>
        </div>
        {replyOpen && (
          <ReplyEmail
            email={replyTarget || email}
            loggedInUser={loggedInUser}
            onClose={() => { setReplyOpen(false); setReplyTarget(null); }}
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
            email={forwardTarget || email}
            loggedInUser={loggedInUser}
            onClose={() => { setForwardOpen(false); setForwardTarget(null); }} />
        )}
        <SnoozeDialog
          open={snoozeOpen}
          onClose={() => setSnoozeOpen(false)}
          onSnooze={handleSnooze}
        />
      </div>
    </div>
  );
};
export default EmailsDetails;
