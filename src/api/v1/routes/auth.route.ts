import { Router } from "express";
import { signup } from "../controllers/auth/signup/signup.controller";
import { login } from "../controllers/auth/login/login.controller";
import { googleAuth } from "../controllers/auth/google/googleAuth.controller";



const authrouter = Router();

authrouter.post("/signup", signup);
authrouter.post("/login", login);
authrouter.post("/google-login", googleAuth);


export default authrouter;