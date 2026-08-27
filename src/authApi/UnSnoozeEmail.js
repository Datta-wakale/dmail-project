// UNSNOOZE EMAIL
const apiUrl = "http://localhost:3000/emails";

export const unsnoozeEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);
  if (!response.ok) {
    throw new Error("Unable to find email");
  }
  const email = await response.json();
  let updatedEmail = { ...email };
  if (folder === "inbox" || folder === "spam") {
    updatedEmail.receiverSnoozedUntil = null;
  }
  if (folder === "sent" || folder === "draft") {
    updatedEmail.senderSnoozedUntil = null;
  }
  const updateResponse = await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });

  if (!updateResponse.ok) {
    throw new Error("Unable to unsnooze email");
  }
  return await updateResponse.json();
};