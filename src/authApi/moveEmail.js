const apiUrl = "http://localhost:3000/emails";

export const moveEmail = async (id, fromFolder, toFolder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  let updatedEmail = { ...email };
  // Email was in receiver's Trash
  if (fromFolder === "receiver") {
    updatedEmail.receiverFolder = toFolder;
  }
  // Email was in sender's Trash
  if (fromFolder === "sender") {
    updatedEmail.senderFolder = toFolder;
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