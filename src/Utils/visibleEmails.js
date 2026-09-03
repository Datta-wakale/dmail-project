import getEmailCategory from "./emailsCategoriesUtils";
import {isEmailForUser, matchesAnyRecipient,} from "./mailUtils";

export const getVisibleEmails = ({
  emails,
  folder,
  loggedInUser,
  search = "",
  filterEmails,
  selectedCategory = "primary",
}) => {
  let folderEmails = emails;

  if (folder === "inbox") {
    folderEmails = emails.filter(
      (email) =>
        matchesAnyRecipient(email.to, loggedInUser) &&
        email.receiverFolder === "inbox" &&
        !email.receiverSnoozedUntil
    ).filter((email) => getEmailCategory(email) === selectedCategory);
  } else if (folder === "sent") {
    folderEmails = emails.filter(
      (email) =>
        isEmailForUser(email.from, loggedInUser) &&
        email.senderFolder === "sent"
    );
  } else if (folder === "spam") {
    folderEmails = emails.filter(
      (email) =>
        (matchesAnyRecipient(email.to, loggedInUser) &&
          email.receiverFolder === "spam") ||
        (isEmailForUser(email.from, loggedInUser) &&
          email.senderFolder === "spam")
    );
  } else if (folder === "starred") {
    folderEmails = emails.filter(
      (email) =>
        email.starred === true &&
        (isEmailForUser(email.from, loggedInUser) ||
          matchesAnyRecipient(email.to, loggedInUser))
    );
  } else if (folder === "drafts") {
    folderEmails = emails.filter(
      (email) =>
        isEmailForUser(email.from, loggedInUser) &&
        (email.isDraft === true || email.senderFolder === "draft") &&
        email.senderFolder === "draft" &&
        !email.senderSnoozedUntil
    );
  } else if (folder === "trash") {
    folderEmails = emails.filter(
      (email) =>
        (isEmailForUser(email.from, loggedInUser) &&
          (email.isDraft === true || email.senderFolder === "draft") &&
          email.senderFolder === "trash") ||
        (matchesAnyRecipient(email.to, loggedInUser) &&
          email.receiverFolder === "trash") ||
        (isEmailForUser(email.from, loggedInUser) &&
          email.senderFolder === "trash") ||
        (isEmailForUser(email.from, loggedInUser) &&
          (email.isDraft === true || email.senderFolder === "draft") &&
          email.senderFolder === "draft")
    );
  } else if (folder === "archive") {
    folderEmails = emails.filter((email) => {
      if (isEmailForUser(email.from, loggedInUser)) {
        return email.senderFolder === "archive";
      }
      if (matchesAnyRecipient(email.to, loggedInUser)) {
        return email.receiverFolder === "archive";
      }
      return false;
    });
  } else if (folder === "snooze") {
    const now = new Date();
    folderEmails = emails.filter((email) => {
      if (matchesAnyRecipient(email.to, loggedInUser)) {
        return (
          email.receiverSnoozedUntil &&
          new Date(email.receiverSnoozedUntil) > now
        );
      }
      if (isEmailForUser(email.from, loggedInUser)) {
        return (
          email.senderSnoozedUntil &&
          new Date(email.senderSnoozedUntil) > now
        );
      }
      return false;
    });
  } else if (folder === "all-mail") {
    folderEmails = emails.filter((email) => {
      if (isEmailForUser(email.from, loggedInUser)) {
        return email.senderFolder !== "trash";
      }
      if (matchesAnyRecipient(email.to, loggedInUser)) {
        return email.receiverFolder !== "trash";
      }
      return false;
    });
  }

  const searchedEmails = filterEmails
    ? filterEmails(folderEmails, search)
    : folderEmails;

  return [...searchedEmails].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};
