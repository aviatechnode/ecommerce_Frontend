// import { setup, assign, fromPromise } from "xstate";
// import { api } from "../api/axios";
// import { setCsrfToken } from "../lib/csrf";

// /* ================= USER ================= */

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   roleName: string;
//   permissions: string[];
//   isSuperAdmin: boolean;
// }

// /* ================= EVENTS ================= */

// type AuthEvent =
//   | { type: "SIGNIN"; email: string; password: string }
//   | { type: "SIGNUP"; name: string; email: string; password: string }
//   | { type: "SIGNIN_GOOGLE" }
//   | { type: "SIGNOUT" }
//   | { type: "RETRY" };

// /* ================= CONTEXT ================= */

// interface Context {
//   user: User | null;
//   error: string | null;
// }

// /* ================= NORMALIZER ================= */

// const normalizeUser = (user: any): User => ({
//   ...user,
//   isSuperAdmin: user.roleName === "SUPER_ADMIN",
// });

// /* ================= MACHINE ================= */

// export const authMachine = setup({
//   types: {
//     context: {} as Context,
//     events: {} as AuthEvent,
//   },

//   actors: {
//     /* ================= SIGNIN ================= */
//     signin: fromPromise(async ({ input }: any) => {
//       const { data } = await api.post("/api/auth/signin", input);

//       setCsrfToken(data.csrfToken);

//       const me = await api.get("/api/auth/me");
//       return normalizeUser(me.data.user);
//     }),

//     /* ================= SIGNUP ================= */
//     signup: fromPromise(async ({ input }: any) => {
//       const { data } = await api.post("/api/auth/signup", input);

//       setCsrfToken(data.csrfToken);

//       return normalizeUser(data.user);
//     }),

//     /* ================= HYDRATE SESSION ================= */
//     hydrate: fromPromise(async () => {
//       try {
//         const refresh = await api.post("/api/auth/refresh");

//         if (refresh.data.csrfToken) {
//           setCsrfToken(refresh.data.csrfToken);
//         }

//         const me = await api.get("/api/auth/me");
//         return normalizeUser(me.data.user);
//       } catch {
//         return null;
//       }
//     }),

//     /* ================= SIGNOUT (REAL FIX) ================= */
//     signout: fromPromise(async () => {
//       try {
//         await api.post("/api/auth/signout"); 
//         // 👆 backend MUST clear refresh token cookie/session
//       } catch {
//         // even if backend fails, still allow frontend cleanup
//       }
//     }),
//   },

//   actions: {
//     setUser: assign({
//       user: ({ event }: any) => event.output,
//     }),

//     clearUser: assign({
//       user: () => null,
//     }),

//     setError: assign({
//       error: ({ event }: any) =>
//         event.error?.message || "Auth error",
//     }),

//     clearError: assign({
//       error: () => null,
//     }),
//   },
// }).createMachine({
//   id: "auth",

//   context: {
//     user: null,
//     error: null,
//   },

//   initial: "hydrating",

//   states: {
//     /* ================= BOOTSTRAP ================= */
//     hydrating: {
//       invoke: {
//         src: "hydrate",

//         onDone: [
//           {
//             guard: ({ event }: any) => !!event.output,
//             target: "authenticated",
//             actions: "setUser",
//           },
//           {
//             target: "unauthenticated",
//             actions: "clearUser",
//           },
//         ],

//         onError: {
//           target: "unauthenticated",
//           actions: "clearUser",
//         },
//       },
//     },

//     /* ================= UNAUTHENTICATED ================= */
//     unauthenticated: {
//       initial: "idle",

//       states: {
//         idle: {
//           on: {
//             SIGNIN: "signingIn",
//             SIGNUP: "signingUp",
//             SIGNIN_GOOGLE: "#auth.hydrating",
//           },
//         },

//         signingIn: {
//           invoke: {
//             src: "signin",

//             input: ({ event }: any) => {
//               if (event.type !== "SIGNIN") throw new Error("Invalid event");
//               return {
//                 email: event.email,
//                 password: event.password,
//               };
//             },

//             onDone: {
//               target: "#auth.authenticated",
//               actions: "setUser",
//             },

//             onError: {
//               target: "idle",
//               actions: "setError",
//             },
//           },
//         },

//         signingUp: {
//           invoke: {
//             src: "signup",

//             input: ({ event }: any) => {
//               if (event.type !== "SIGNUP") throw new Error("Invalid event");
//               return {
//                 name: event.name,
//                 email: event.email,
//                 password: event.password,
//               };
//             },

//             onDone: {
//               target: "verifying",
//               actions: "setUser",
//             },

//             onError: {
//               target: "idle",
//               actions: "setError",
//             },
//           },
//         },

//         verifying: {
//           on: {
//             SIGNIN: "idle",
//           },
//         },
//       },
//     },

//     /* ================= AUTHENTICATED ================= */
//     authenticated: {
//       on: {
//         SIGNOUT: {
//           target: "unauthenticated",
//           actions: "clearUser",
//           invoke: {
//             src: "signout",
//           },
//         },

//         SIGNIN_GOOGLE: "hydrating",
//       },
//     },
//   },
// });