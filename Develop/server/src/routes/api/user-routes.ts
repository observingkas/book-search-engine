import { Router } from "express";
import { authMiddleware } from "../../services/auth";

const router = Router();

import {
  createUser,
  getSingleUser,
  saveBook,
  deleteBook,
  login,
} from "../../controllers/user-controller.js";

// put authMiddleware anywhere we need to send a token for verification of user
router.route("/").post(createUser).put(authMiddleware, saveBook);

router.route("/login").post(login);

router.route("/me").get(authMiddleware, getSingleUser);

router.route("/books/:bookId").delete(authMiddleware, deleteBook);

export default router;
