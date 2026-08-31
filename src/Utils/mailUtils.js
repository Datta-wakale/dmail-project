export const normalizeEmailAddress = (value) => {
  if (!value) {
    return "";
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  return normalized.includes("@") ? normalized : `${normalized}@dmail.com`;
};

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

export const matchesAnyRecipient = (recipients, targetEmail) => {
  const target = normalizeEmailAddress(targetEmail);
  if (!target) {
    return false;
  }

  return splitRecipients(recipients).includes(target);
};

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

export const formatMailDate = (value) => {
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
