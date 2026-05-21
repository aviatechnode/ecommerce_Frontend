const CSRF_KEY = "csrfToken";

let csrfToken: string | null =
  sessionStorage.getItem(CSRF_KEY);

export const getCsrfToken = () => {
  return csrfToken;
};

export const setCsrfToken = (
  token: string | null
) => {
  csrfToken = token;

  if (token) {
    sessionStorage.setItem(
      CSRF_KEY,
      token
    );
  } else {
    sessionStorage.removeItem(
      CSRF_KEY
    );
  }
};