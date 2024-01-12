const getUser = (token, openPrint) => {
    const apiUrl = 'http://localhost:3000/api/auth/get_user';
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    // headers.append('Accept', 'application/json');

    headers.append('Access-Control-Allow-Origin', 'http://localhost:3000');
    // headers.append('Access-Control-Allow-Credentials', 'true');

    return fetch(apiUrl, {
        method: 'POST', headers: headers, body: JSON.stringify({"token": token}),
    })
        .then( response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if(openPrint) console.log('Data from API:', data);
            return data;
        })
        .catch(error => {
            console.error('Error posting data:', error);
        });
}

module.exports = getUser