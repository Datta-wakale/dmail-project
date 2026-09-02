const apiUrl = "http://localhost:3000/users";

export const getUserByEmail = async (email) => {
    const response = await fetch(`${apiUrl}?email=${encodeURIComponent(email)}`);
    console.log("response :: 5 ", response);
    if (!response.ok) {
        throw new Error("Unable to find user");
    }

    const users = await response.json();

    return users.length > 0 ? users[0] : null;
};
