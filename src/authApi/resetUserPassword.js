import bcrypt from "bcryptjs"

const api_url = "http://localhost:3000/users";

export const resetUserPassword =async (id, newPassword)=> {

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const response = await fetch(`${api_url}/${id}`, {
        method: "PATCH",
        headers : {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            password : hashedPassword
        })
    });
    if(!response.ok){
        throw new Error("did not get the response");
    }
    return await response.json();
}