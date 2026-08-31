const apiUrl = "http://localhost:3000/emails";

// GET All Emails
export const getEmails = async () => {
  const response = await fetch(apiUrl);
  return await response.json();
};

// POST Send Email
export const sendEmail = async (email) => {
  const normalizedTo = Array.isArray(email.to)
    ? email.to.join(", ")
    : String(email.to ?? "").trim();

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...email,
      to: normalizedTo,
      // New email gets a new threadId.
      threadId: email.threadId || crypto.randomUUID(),
 
      senderFolder: email.senderFolder || "sent",
      receiverFolder: email.receiverFolder || "inbox",
      read: email.read ?? false,
    }),
  });

  return await response.json();
};

export const createWelcomeEmail = async (user) => {
  if (!user?.email) {
    return null;
  }

  const existingEmails = await getEmails();
  const alreadyExists = existingEmails.some((mail) => {
    const normalizedTo = String(mail.to || "")
      .split(/[;,]/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    return (
      mail.subject === "Welcome to D-mail" &&
      normalizedTo.includes(String(user.email).trim().toLowerCase())
    );
  });

  if (alreadyExists) {
    return existingEmails.find((mail) => {
      const normalizedTo = String(mail.to || "")
        .split(/[;,]/)
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

      return (
        mail.subject === "Welcome to D-mail" &&
        normalizedTo.includes(String(user.email).trim().toLowerCase())
      );
    });
  }

  const welcomeEmail = {
    from: "dmail-team@dmail.com",
    to: user.email,
    subject: "Welcome to D-mail",
    message: `Hi ${user.fname || "there"},\n\nWelcome to D-mail! We are excited to have you here. Your inbox is ready, and this is your first welcome message from the D-mail team.\n\nStart exploring your inbox and enjoy a cleaner, smarter way to stay connected.\n\nBest regards,\nD-mail Team`,
    attachment: null,
    createdAt: new Date().toISOString(),
    senderFolder: "sent",
    receiverFolder: "inbox",
    read: false,
    welcome: true,
  };

  return await sendEmail(welcomeEmail);
};


// MOVE EMAIL TO TRASH
// export const deleteEmail = async (id, folder) => {
//   const response = await fetch(`${apiUrl}/${id}`);

//   if (!response.ok) {
//     throw new Error("Unable to find email");
//   }
//   const email = await response.json();
//   let updatedEmail;
//   if (folder === "inbox") {
//     updatedEmail = {
//       ...email,
//       receiverFolder: "trash",
//     };
//   }
//   if(folder === "spam"){
//     updatedEmail = {
//       ...email,
//       receiverFolder: "trash"
//     }
//   }
//   if (folder === "sent") {
//     updatedEmail = {
//       ...email,
//       senderFolder: "trash",
//     };
//   }
//   if (folder === "draft") {
//   updatedEmail = {
//     ...email,
//     senderFolder: "trash",
//   };
// }
//   const updateResponse = await fetch(`${apiUrl}/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(updatedEmail),
//   });
//   if (!updateResponse.ok) {
//     throw new Error("Unable to move email to trash");
//   }
//   return await updateResponse.json();
// };
export const deleteEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  let updatedEmail;

  // Inbox → Trash
  if (folder === "inbox") {
    updatedEmail = {
      ...email,
      receiverFolder: "trash",
    };
  }

  // Spam → Trash
  if (folder === "spam") {
    // Received email is in Spam
    if (email.receiverFolder === "spam") {
      updatedEmail = {
        ...email,
        receiverFolder: "trash",
      };
    }

    // Sent email is in Spam
    else if (email.senderFolder === "spam") {
      updatedEmail = {
        ...email,
        senderFolder: "trash",
      };
    }
  }

  // Sent → Trash
  if (folder === "sent") {
    updatedEmail = {
      ...email,
      senderFolder: "trash",
    };
  }

  // Draft → Trash
  if (folder === "draft") {
    updatedEmail = {
      ...email,
      senderFolder: "trash",
    };
  }

  if (!updatedEmail) {
    throw new Error("Unable to determine email folder");
  }

  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to move email to trash");
  }

  return await updateResponse.json();
};
// MOVE EMAIL TO SPAM
// export const moveEmailToSpam = async (id) => {
//   const response = await fetch(`${apiUrl}/${id}`);

//   if (!response.ok) {
//     throw new Error("Unable to find email");
//   }

//   const email = await response.json();

//   const updatedEmail = {
//     ...email,
//     receiverFolder: "spam",
//   };

//   const updateResponse = await fetch(`${apiUrl}/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(updatedEmail),
//   });

//   if (!updateResponse.ok) {
//     throw new Error("Unable to move email to spam");
//   }

//   return await updateResponse.json();
// };
export const moveEmailToSpam = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  const updatedEmail = {
    ...email,
  };

  // Received email
  if (
    folder === "inbox" ||
    folder === "spam" ||
    folder === "starred-received"
  ) {
    updatedEmail.receiverFolder = "spam";
  }

  // Sent email
  if (
    folder === "sent" ||
    folder === "starred-sent"
  ) {
    updatedEmail.senderFolder = "spam";
  }

  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to move email to spam");
  }

  return await updateResponse.json();
};
// STAR / UNSTAR EMAIL
export const toggleStarEmail = async (id, starred) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  const updatedEmail = {
    ...email,
    starred: starred,
  };

  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to update star");
  }
  return await updateResponse.json();
};

// PERMANENT DELETE FROM TRASH
// export const permanentlyDeleteEmail = async (id) => {
//   const response = await fetch(`${apiUrl}/${id}`, {
//     method: "DELETE",
//   });

//   if (!response.ok) {
//     throw new Error("Unable to permanently delete email");
//   }

//   return true;
// };
// PERMANENT DELETE FROM TRASH
export const permanentlyDeleteEmail = async (id) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  // If receiver's copy is in Trash
  if (email.receiverFolder === "trash") {
    const updatedEmail = {
      ...email,
      receiverFolder: "deleted",
    };

    // Delete complete record ONLY when both users
    // have permanently deleted their copies
    if (updatedEmail.senderFolder === "deleted") {
      const deleteResponse = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        throw new Error("Unable to permanently delete email");
      }

      return true;
    }

    const updateResponse = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEmail),
    });

    if (!updateResponse.ok) {
      throw new Error("Unable to permanently delete email");
    }

    return await updateResponse.json();
  }

  // If sender's copy is in Trash
  if (email.senderFolder === "trash") {
    const updatedEmail = {
      ...email,
      senderFolder: "deleted",
    };

    // Delete complete record ONLY when both users
    // have permanently deleted their copies
    if (updatedEmail.receiverFolder === "deleted") {
      const deleteResponse = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        throw new Error("Unable to permanently delete email");
      }
      return true;
    }
    const updateResponse = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEmail),
    });
    if (!updateResponse.ok) {
      throw new Error("Unable to permanently delete email");
    }
    return await updateResponse.json();
  }
  throw new Error("Email is not in Trash");
};
// RESTORE EMAIL FROM TRASH
export const restoreEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  let updatedEmail;

  if (folder === "inbox") {
    updatedEmail = {
      ...email,
      receiverFolder: "inbox",
    };
  }

  if (folder === "sent") {
    updatedEmail = {
      ...email,
      senderFolder: "sent",
    };
  }

  if (!updatedEmail) {
    throw new Error("Invalid folder");
  }

  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to restore email");
  }
  return await updateResponse.json();
};
// Save email as draft
export const saveDraft = async (draftData) => {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...draftData,
            senderFolder: "draft",
        }),
    });

    if (!response.ok) {
        throw new Error("Unable to save draft");
    }

    return await response.json();
};

export const updateDraft = async (id, draftData) => {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...draftData,
            id,
            senderFolder: "draft",
        }),
    });

    if (!response.ok) {
        throw new Error("Unable to update draft");
    }

    return await response.json();
};

// delete the draft permanently
export const deleteDraft = async(id)=>{

    const response = await fetch(`${apiUrl}/${id}`,{
        method: "DELETE",
    });
    if(!response.ok){
        throw new Error("Unable to delete draft");
    }
    return true;
}

export const archiveEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  let updatedEmail;

  // Received email
  if (folder === "inbox" || folder === "spam" || folder === "starred-received") {
    updatedEmail = {
      ...email,
      receiverFolder: "archive",
    };
  }

  // Sent email
  if (folder === "sent" || folder === "starred-sent") {
    updatedEmail = {
      ...email,
      senderFolder: "archive",
    };
  }

  // Archive is not valid for Trash or Draft
  if (!updatedEmail) {
    throw new Error(`Cannot archive email from folder: ${folder}`);
  }

  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to archive email");
  }

  return await updateResponse.json();
};

export const snoozeEmail = async (id, folder, snoozedUntil) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  let updatedEmail = { ...email };

  if (folder === "inbox") {
    updatedEmail.receiverSnoozedUntil = snoozedUntil;
  }

  if (folder === "sent") {
    updatedEmail.senderSnoozedUntil = snoozedUntil;
  }

  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to snooze email");
  }
  return await updateResponse.json();
};