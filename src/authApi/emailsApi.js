const apiUrl = "http://localhost:3000/emails";

// GET All Emails
export const getEmails = async () => {
  const response = await fetch(apiUrl);
  return await response.json();
};

// POST Send Email
export const sendEmail = async (email) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...email,
      senderFolder: "sent",
      receiverFolder: "inbox",
    }),
  });
  return await response.json();
};


// MOVE EMAIL TO TRASH
export const deleteEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  let updatedEmail;

  if (folder === "inbox") {
    updatedEmail = {
      ...email,
      receiverFolder: "trash",
    };
  }
  if(folder === "spam"){
    updatedEmail = {
      ...email,
      receiverFolder: "trash"
    }
  }
  if (folder === "sent") {
    updatedEmail = {
      ...email,
      senderFolder: "trash",
    };
  }
  if (folder === "draft") {
  updatedEmail = {
    ...email,
    senderFolder: "trash",
  };
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
export const moveEmailToSpam = async (id) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  const updatedEmail = {
    ...email,
    receiverFolder: "spam",
  };

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
export const permanentlyDeleteEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);
  if (!response.ok) {
    throw new Error("Unable to find email");
  }
  const email = await response.json();
  let updatedEmail = { ...email };
  if (folder === "sent") {
    updatedEmail.senderFolder = "deleted";
  }
  if (folder === "inbox") {
    updatedEmail.receiverFolder = "deleted";
  }
  // If both sides deleted the email, remove it completely
  if (updatedEmail.senderFolder === "deleted" && updatedEmail.receiverFolder === "deleted") {
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

// MOVE EMAIL TO ARCHIVE
// export const archiveEmail = async (id, folder) => {
//   const response = await fetch(`${apiUrl}/${id}`);

//   if (!response.ok) {
//     throw new Error("Unable to find email");
//   }

//   const email = await response.json();
//   let updatedEmail;
//   if ( folder === "inbox" || folder === "spam" ||
//     folder === "starred-received") {
//     updatedEmail = {
//       ...email,
//       receiverFolder: "archive",
//     };
//   }

//   if (
//     folder === "sent" ||
//     folder === "starred-sent"
//   ) {
//     updatedEmail = {
//       ...email,
//       senderFolder: "archive",
//     };
//   }

//   if (!updatedEmail) {
//     throw new Error("Invalid folder");
//   }

//   const updateResponse = await fetch(`${apiUrl}/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(updatedEmail),
//   });

//   if (!updateResponse.ok) {
//     throw new Error("Unable to archive email");
//   }
//   return await updateResponse.json();
// };
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
// SNOOZE EMAIL
// export const snoozeEmail = async (id, folder, snoozedUntil) => {
//   const response = await fetch(`${apiUrl}/${id}`);

//   if (!response.ok) {
//     throw new Error("Unable to find email");
//   }
//   const email = await response.json();
//   let updatedEmail = { ...email };

//   // Received email
//   if (
//     folder === "inbox" ||
//     folder === "spam" ||
//     folder === "starred-received"
//   ) {
//     updatedEmail.receiverSnoozedUntil = snoozedUntil;
//   }

//   // Sent email
//   if (
//     folder === "sent" ||
//     folder === "starred-sent"
//   ) {
//     updatedEmail.senderSnoozedUntil = snoozedUntil;
//   }
//   if (!updatedEmail.receiverSnoozedUntil &&
//       !updatedEmail.senderSnoozedUntil) {
//     throw new Error("Invalid folder");
//   }

//   const updateResponse = await fetch(`${apiUrl}/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(updatedEmail),
//   });
//   if (!updateResponse.ok) {
//     throw new Error("Unable to snooze email");
//   }
//   return await updateResponse.json();
// };

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