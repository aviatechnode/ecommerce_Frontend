import { createActor } from "xstate";
import { authMachine } from "../hook/authMachine";

export const authService = createActor(authMachine).start();