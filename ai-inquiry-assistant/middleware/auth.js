import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  // authorisation format "BEarer <token>" so we extract token
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized user, token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded
    next()

  } catch (error) {
    res
      .status(401)
      .json({ error: "Unauthorized user", details: error.message });
  }
};
