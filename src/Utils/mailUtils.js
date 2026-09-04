// normalize email address to lowercase , add default domain if missing
export const normalizeEmailAddress = (value) => {
  if (!value) {
    return "";
  }

  const normalized = String(value).trim().toLowerCase();
  if(!normalized) {
    return "";
  }
  return normalized.includes("@") ? normalized : `${normalized}@dmail.com`;
};

// get the email address of the user from the email object
export const splitRecipients = (value) => {
  if (!value) {
    return [];
  }
  const rawRecipients = Array.isArray(value) ? value : String(value).split(/[;,]/);
  return rawRecipients
    .flatMap((recipient) => String(recipient).split(" "))
    .map((recipient) => recipient.trim())
    .filter(Boolean)
    .map((recipient) => normalizeEmailAddress(recipient));
};

// match the email address of the user with the email object
export const matchesAnyRecipient = (recipients, targetEmail) => {
  const targets = typeof targetEmail === "object" && targetEmail
    ? getUserEmailAddresses(targetEmail)
    : [normalizeEmailAddress(targetEmail)];
  if (!targets.length || !recipients) {
    return false;
  }
  return splitRecipients(recipients).some((recipient) =>
    targets.includes(recipient)
  );
};

// is the email in trash for the current user
export const isEmailInTrash = (email, currentUserEmail) => {
  if (!email) {
    return false;
  }
  const currentUser = normalizeEmailAddress(currentUserEmail);
  const isSentByMe = normalizeEmailAddress(email.from) === currentUser;
  const isReceivedByMe = matchesAnyRecipient(email.to, currentUser);

  if (isSentByMe && email.senderFolder === "trash") {
    return true;
  }

  if (isReceivedByMe && email.receiverFolder === "trash") {
    return true;
  }
  return false;
};

// get the source label of the email based on the folder and current user
export const getEmailSourceLabel = (email, folder, currentUser) => {
  if (!email || folder === "trash") {
    return "";
  }
  const isDraft = email.isDraft === true || email.senderFolder === "draft";
  if (folder === "draft" || folder === "drafts" || isDraft) {
    const source = email.senderOriginFolder || email.originFolder || "";
    return source ? source.charAt(0).toUpperCase() + source.slice(1) : "";
  }
  if (folder !== "starred" && folder !== "all-mail") {
    return "";
  }
  if (isEmailForUser(email.from, currentUser)) {
    const source = email.senderOriginFolder || email.originFolder || "";
    return source ? source.charAt(0).toUpperCase() + source.slice(1) : "";
  }
  if (matchesAnyRecipient(email.to, currentUser)) {
    const source = email.receiverOriginFolder ||
      email.originFolder ||
      (email.receiverFolder === "inbox" ? "inbox" : "");
    return source ? source.charAt(0).toUpperCase() + source.slice(1) : "";
  }
  return "";
};

// check if the email can be replied or forwarded based on the folder and current user
export const canUseReplyOrForward = (email, currentUserEmail) => {
  if (!email || !currentUserEmail) {
    return false;
  }

  return !isEmailInTrash(email, currentUserEmail);
};

export const joinRecipients = (value) => {
  const recipients = splitRecipients(value);
  return recipients.join(", ");
};

export const formatMailDate = (value) =>{

  if (!value) {
    return "Today";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (diffInDays === 1) {
    return "Yesterday";
  }

  if (diffInDays < 7) {
    return date.toLocaleDateString([], {
      weekday: "short",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

// get the display label for the sender of the email based on the current user
export const getSenderDisplayLabel = (email, currentUserEmail) => {
  if (!email) {
    return "";
  }

  const currentUser = normalizeEmailAddress(currentUserEmail);
  const sender = normalizeEmailAddress(email.from);

  if (sender && currentUser && sender === currentUser) {
    return "me";
  }

  return email.from || "Unknown sender";
};

// get the display label for the receiver of the email based on the current user
export const getReceiverDisplayLabel = (email, currentUserEmail) => {
  if (!email) {
    return "";
  }
  const currentUser = normalizeEmailAddress(currentUserEmail);
  const sender = normalizeEmailAddress(email.from);

  if (matchesAnyRecipient(email.to, currentUserEmail)) {
    if (sender && currentUser && sender === currentUser) {
      return "you";
    }
    return "me";
  }
  return email.to || "Unknown recipient";
};

// for edit email utility functions

export const getUserEmailAddresses = (user) => {
    if (!user) {
        return [];
    }
    const currentEmail = normalizeEmailAddress(user.email);

    const aliases = Array.isArray(user.emailAliases)
        ? user.emailAliases.map((email) =>
            normalizeEmailAddress(email)
        )
        : [];

    return [
        ...new Set(
            [currentEmail, ...aliases].filter(Boolean)
        ),
    ];
};

export const isEmailForUser = (email, user) => {
    const normalizedEmail = normalizeEmailAddress(email);

    if (!normalizedEmail || !user) {
        return false;
    }
    return getUserEmailAddresses(user).includes(
        normalizedEmail
    );
};

export const getEmailFolderForUser = (email, user) => {
  if (!email || !user) {
    return null;
  }

  if (isEmailForUser(email.from, user)) {
    return email.senderFolder || "sent";
  }

  if (matchesAnyRecipient(email.to, user)) {
    return email.receiverFolder || "inbox";
  }

  return null;
};
