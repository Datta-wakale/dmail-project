const apiUrl = "http://localhost:3000/emails";

export const moveEmail = async (id, fromFolder, toFolder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  const updatedEmail = { ...email };

  // Trash uses sender/receiver because
  // the same email can have different folders for sender and receiver.
  if (fromFolder === "sender"){
    updatedEmail.senderFolder = toFolder;
  } else if (fromFolder === "receiver") {
    updatedEmail.receiverFolder = toFolder;
  }

  // Normal folders
  else if (
    ["inbox", "spam", "archive", "draft", "sent"].includes(fromFolder)
  ) {
    if (email.senderFolder === fromFolder) {
      updatedEmail.senderFolder = toFolder;
    }

    if (email.receiverFolder === fromFolder) {
      updatedEmail.receiverFolder = toFolder;
    }
  }

  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to move email");
  }
  return await updateResponse.json();
};
