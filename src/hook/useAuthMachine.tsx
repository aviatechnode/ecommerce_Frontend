import { useSyncExternalStore } from "react";
import { createActor } from "xstate";
import { authMachine } from "./authMachine";

/* ================= SINGLETON ================= */

const authService = createActor(authMachine).start();

/* ================= NORMALIZER ================= */

function normalizeState(value: any): string {
  if (typeof value === "string") return value;

  if (typeof value === "object" && value !== null) {
    const parent = Object.keys(value)[0];
    const child = value[parent];
    return `${parent}.${child}`;
  }

  return "";
}

/* ================= HOOK ================= */

export function useAuthMachine() {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      const sub = authService.subscribe(() => {
        onStoreChange();
      });

      return () => sub.unsubscribe();
    },
    () => authService.getSnapshot(),
    () => authService.getSnapshot()
  );

  return {
    state: normalizeState(state.value),
    context: state.context,

    SIGNIN: (email: string, password: string) =>
      authService.send({ type: "SIGNIN", email, password }),

    SIGNUP: (name: string, email: string, password: string) =>
      authService.send({ type: "SIGNUP", name, email, password }),

    SIGNIN_GOOGLE: () =>
      authService.send({ type: "SIGNIN_GOOGLE" }),

    SIGNOUT: () =>
      authService.send({ type: "SIGNOUT" }),

    RETRY: () =>
      authService.send({ type: "RETRY" }),
  };
}