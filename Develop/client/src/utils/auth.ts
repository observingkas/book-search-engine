// Import dependencies
import { jwtDecode } from "jwt-decode";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";

//Define authentication configuration
const secret = "mysecretsshhhhh";
const expiration = "2h";

//Define user token interface
interface UserToken {
  name: string;
  exp: number;
}

//GraphQL authentication middleware
export const authMiddleware = ({ req }) => {
  let token = req.headers.authorization || "";

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  if (!token) {
    return { req };
  }

  try {
    const { data } = jwt.verify(token, secret);
    return { user: data, req };
  } catch {
    throw new GraphQLError("Invalid token", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
};

//Token signing for GraphQl mutations
export const signToken = ({ username, email, _id }) => {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

//Client-side authentication service class
class AuthService {
  //Get user data
  getProfile() {
    return jwtDecode(this.getToken() || "");
  }

  //Check if user's logged in
  loggedIn() {
    //Checks if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  //Check if token is expired
  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<UserToken>(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem("id_token");
  }

  //Handle user login
  login(idToken: string) {
    localStorage.setItem("id_token", idToken);
    window.location.assign("/");
  }

  //Handle user logout
  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem("id_token");
    // this will reload the page and reset the state of the application
    window.location.assign("/");
  }
}

export default new AuthService();
