let csrfToken: string | null = null;

export const getCsrfToken = () => csrfToken;

export const setCsrfToken = (token: string | null) => {
  csrfToken = token;
};