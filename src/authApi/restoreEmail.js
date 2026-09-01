const apiUrl = "http://localhost:3000/emails";

export const restoreEmail = async (id, folder) => {
  const response = await fetch(`${apiUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Unable to find email");
  }

  const email = await response.json();

  let updatedEmail = { ...email };

  // Inbox  Undo  Inbox
  if (folder === "inbox") {
    updatedEmail.receiverFolder = "inbox";
  }

  // Spam  Undo
  if (folder === "spam") {

    // Received Spam  Trash Undo  Spam
    if (email.receiverFolder === "trash") {
      updatedEmail.receiverFolder = "spam";
    }

    // Sent Spam  Trash  Undo Spam
    else if (email.senderFolder === "trash") {
      updatedEmail.senderFolder = "spam";
    }

    else {
      throw new Error("Unable to determine spam folder");
    }
  }

  // Sent  Undo Sent
  if (folder === "sent") {
    updatedEmail.senderFolder = "sent";
  }

  // Archive Undo Archive
  if (folder === "archive") {
    if (email.receiverFolder === "trash") {
      updatedEmail.receiverFolder = "archive";
    } else if (email.senderFolder === "trash") {
      updatedEmail.senderFolder = "archive";
    }
  }
 
  // Draft  Undo  Draft
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
    headers:{
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedEmail),
  });
  if (!updateResponse.ok) {
    throw new Error("Unable to restore archived email");
  }
  return await updateResponse.json();
};

// restore spam emails 

export const restoreSpamEmail = async(id)=> {
    const response = await fetch(`${apiUrl}/${id}`);
    if(!response.ok){
        throw new Error("Unable to find email");
    }

    const email = await response.json();
    let updatedEmail;
    // if email is from inbox report as spam then move it to inbox folder
    if(email.receiverFolder === "spam"){
        updatedEmail = { ...email, receiverFolder: "inbox"}
    }
    // if email is from sent report as spam then move it to sent folder
    else if(email.senderFolder === "spam"){
       updatedEmail = { ...email, senderFolder: "sent"}
    }

    if(!updatedEmail){
        throw new Error("Unable to restore spam email");
    }

    const updateResponse = await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedEmail)
    });
    if(!updateResponse.ok){
      throw new Error("Unable to restore spam email");
    }
    return await updateResponse.json();
}