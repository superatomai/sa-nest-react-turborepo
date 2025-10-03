const getApiEndpoint = () => {
  const vite_local_api_url = import.meta.env.VITE_LOCAL_API_URL;
  const vite_api_url = import.meta.env.VITE_API_URL;

  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  let apiUrl;

  // for local dev
  if (isLocalHost) {
    apiUrl = vite_local_api_url;
  } else {
    // Use VITE_API_URL set per environment in Cloudflare
    apiUrl = vite_api_url;
  }

  console.log("Using API URL:", apiUrl);

  return apiUrl;
};

export const API_URL = getApiEndpoint();
