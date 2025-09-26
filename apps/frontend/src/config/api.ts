const getApiEndpoint = ()=>{

    // for local dev
    if(import.meta.env.DEV){
        return import.meta.env.VITE_API_URL || 'http://localhost:3000';
    }

    const branch = import.meta.env.VITE_CF_PAGES_BRANCH;

    switch(branch){
        case 'dev':
            return 'https://devruntime.superatom.ai';
        case 'main':
            return 'https://api.superatom.ai';
        default:
            return 'https://api.superatom.ai';
    }

}

export const API_URL = getApiEndpoint();