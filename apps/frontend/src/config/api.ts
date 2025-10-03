const getApiEndpoint = () => {
  const vite_local_api_url = import.meta.env.VITE_LOCAL_API_URL;
  const vite_dev_api_url = import.meta.env.VITE_DEV_API_URL;
  const vite_prod_api_url = import.meta.env.VITE_PROD_API_URL;

  const branch = import.meta.env.CF_PAGES_BRANCH || import.meta.env.VITE_CF_PAGES_BRANCH;

  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  let apiUrl;

  // for local dev
  if (isLocalHost) {
    apiUrl = vite_local_api_url;
  } else if (branch === "main") {
    apiUrl = vite_prod_api_url;
  } else if (branch === "dev") {
    apiUrl = vite_dev_api_url;
  } else {
    // fallback to prod if branch is unknown
    apiUrl = vite_prod_api_url;
  }

  console.log("Branch:", branch);
  console.log("Using API URL:", apiUrl);

  return apiUrl;
};

export const API_URL = getApiEndpoint();
