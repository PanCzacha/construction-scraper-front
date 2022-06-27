export const apiCall = async (endpoint: string, method = "GET", body?: any): Promise<any> => {
    const apiURL = process.env.REACT_APP_API_URL ?? "http://localhost:3001";

    if(method === "GET") {
        return await fetch(`${apiURL}${endpoint}`);
    }
    else if(method === "POST" || "PATCH" || "PUT")
    {
        return await fetch(`${apiURL}${endpoint}`, {
            method: `${method}`,
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(body),
        });
    }
    else
    {
        return await fetch(`${apiURL}${endpoint}`, {
            method: `${method}`
        })
    }

}
