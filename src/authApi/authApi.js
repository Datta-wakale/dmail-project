import bcrypt from "bcryptjs";

const API_URL = "http://localhost:3000/users";
// Normalize email to ensure it includes the dmail domain
const normalizeEmail = (email) => {
  if (!email) return email;
  const trimmed = String(email).trim();
  return trimmed.includes("@") ? trimmed : `${trimmed}@dmail.com`;
};

// Get all users
export const getUsers = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to fetch users");
  }

  return await response.json();
};


// Check whether email exists (returns the user object or null)
export const checkEmailExists = async (email) => {
  const normalized = normalizeEmail(email);
  const response = await fetch(`${API_URL}?email=${encodeURIComponent(normalized)}`);

  if (!response.ok) {
    throw new Error("Unable to check email");
  }
  const users = await response.json();
  // json-server returns an array for query; return the first match or null
  return users && users.length ? users[0] : null;
};

// Register user
// export const registerUser = async (userData) => {
//   const normalizedEmail = normalizeEmail(userData.email);
//   const hashedPassword = await bcrypt.hash(userData.password, 10);
//   const emailExists = await checkEmailExists(normalizedEmail);

//   if (emailExists) {
//     return null;
//   }

//   const response = await fetch(API_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       ...userData,
//       email: normalizedEmail,
//       password: hashedPassword,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Registration failed");
//   }

//   return await response.json();
// };

export const registerUser = async (userData) => {
  const normalizedEmail = normalizeEmail(userData.email);
  const emailExists = await checkEmailExists(normalizedEmail);
  if (emailExists) {
    return null;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...userData,
      email: normalizedEmail,
    }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return await response.json();
};
// Login user
export const loginUser = async (email, password) => {
  const normalized = normalizeEmail(email);
  const response = await fetch(`${API_URL}?email=${encodeURIComponent(normalized)}`);
  if (!response.ok) {
    throw new Error("Unable to login");
  }
  const users = await response.json();
  const user = users.find(
    (user) =>
      user.email === normalized &&
      user.password === password
  );
  return user;
};
// Login user
// export const loginUser = async (email, password) => {
//   const normalized = normalizeEmail(email);

//   const response = await fetch(
//     `${API_URL}?email=${encodeURIComponent(normalized)}`
//   );

//   if (!response.ok) {
//     throw new Error("Unable to login");
//   }

//   const users = await response.json();

//   const user = users[0];

//   if (!user) {
//     return null;
//   }

//   return await bcrypt.compare(password, user.password)
//     ? user
//     : null;
// };

// Delete user
export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete user");
  }

  return true;
};

// Update user
export const updateUser = async (id, userData) => {
  // Create a new object.
  const updatedUser = {
    ...userData,
    id,
  };

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedUser),
  });
  if (!response.ok) {
    throw new Error("Unable to update user");
  }
  return await response.json();
};

// Check whether phone exists
export const checkPhoneExists = async (phone) => {
  const phoneValue = String(phone).trim();
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Unable to fetch users");
  }
  const users = await response.json();
  return users.find(
    (user) => String(user.phone).trim() === phoneValue) || null;
};