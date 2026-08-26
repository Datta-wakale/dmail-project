const apiUrl = "http://localhost:3000/emails";

export const restoreEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);
  if (!response.ok) {
    throw new Error("Unable to find email");
  }
  const email = await response.json();
  let updatedEmail = { ...email };
  if (folder === "inbox" || folder === "spam") {
    updatedEmail.receiverFolder = folder;
  }
  if (folder === "sent") {
  updatedEmail.senderFolder = "sent";
}
if (folder === "draft") {
  updatedEmail.senderFolder = "draft";
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

// restore archieve emails 
// RESTORE ARCHIVED EMAIL
export const restoreArchivedEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);
  if (!response.ok) {
    throw new Error("Unable to find email");
  }
  const email = await response.json();
  const updatedEmail = { ...email };
  if (folder === "inbox" || folder === "spam") {
    updatedEmail.receiverFolder = folder;
  }
  if (folder === "sent") {
    updatedEmail.senderFolder = "sent";
  }
  if (folder === "draft") {
    updatedEmail.senderFolder = "draft";
  }
  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });
  if (!updateResponse.ok) {
    throw new Error("Unable to restore archived email");
  }
  return await updateResponse.json();
};