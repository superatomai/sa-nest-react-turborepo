const getApiEndpoint = () => {
  const vite_api_url = import.meta.env.VITE_API_URL;
  
  console.log("Using API URL:", vite_api_url);

  return vite_api_url;
};

export const API_URL = getApiEndpoint();
