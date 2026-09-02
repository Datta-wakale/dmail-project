const API_URL = "http://localhost:3000/emails";

export const updateEmail = async (id, emailData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...emailData,
      id,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update email");
  }
  return await response.json();
};

// export const addUser = async(user)=> {
//   try {
//     const response = await fetch(API_URL, {

//       method: "POST",
//       headers: {
//         "Content-Type" : "application/json"
//       },
//       body: JSON.stringify()
//     });
//   } catch (error) {
    
//   }
// }