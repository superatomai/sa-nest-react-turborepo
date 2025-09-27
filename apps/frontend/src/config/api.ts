const getApiEndpoint = ()=>{

    let apiUrl = 'https://api.superatom.ai';


    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // for local dev
    if(isLocalHost){

        apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
    }

    const branch = import.meta.env.VITE_CF_PAGES_BRANCH;

    if(branch === 'main'){
        apiUrl = 'https://api.superatom.ai';
    }
    else if(branch === 'dev'){
        apiUrl = 'https://devruntime.superatom.ai';
    }
    
    console.log("Using API URL:", apiUrl);

    return apiUrl;

}

export const API_URL = getApiEndpoint();