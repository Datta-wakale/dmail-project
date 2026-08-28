const getEmailCategory = (email) => {
  const text = ` ${email.from || ""} ${email.subject || ""}
    ${email.message || ""}
  `.toLowerCase();

  // Promotions
  if (text.includes("offer") || text.includes("discount") ||
    text.includes("sale") || text.includes("coupon") ||
    text.includes("deal") || text.includes("shopping") ||
    text.includes("buy now")) {
    return "promotions";
  }

  // Social
  if ( text.includes("instagram") || text.includes("facebook") ||
   text.includes("linkedin") || text.includes("twitter") ||
    text.includes("follow") || text.includes("comment") ||
    text.includes("friend")) {
    return "social";
  }

  // Updates
  if ( text.includes("otp") || text.includes("verification") ||
    text.includes("notification") || text.includes("alert") ||
    text.includes("password") || text.includes("security") ||
    text.includes("update") ) {
    return "updates";
  }
  // Everything else
  return "primary";
};

export default getEmailCategory;