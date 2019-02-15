    async function BROKENmanagerLoginAjax(username, password, role) {
        let url = 'https://leashtime.com/mmd-login.php';
        const options = {
            method : 'POST',
            body : JSON.stringify({
                user_name : username,
                user_pass: password,
                expected_role : role
            }),
            credentials : 'include',
            mode : 'same-origin',
            //'credentials' : 'same-origin',
            headers : {
                'Accept': 'application/json',
                'Content-Type' : 'application/json',
                'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
            }
        };

        let response = await fetch(url, options)
        let data = response.json();
        console.log('RESPONSE CODE: ' + response.status);
        console.log('RESPONSE data: ' + JSON.stringify(data));
    }

    async function managerLoginAjax(username, password, role) {  // THIS VERSION WORKS
        let url = 'https://leashtime.com/mmd-login.php';
        let myForm = {
            user_name : username,
            user_pass: password,
            expected_role : role
        };

        var data = new FormData();
        data.append( "json", JSON.stringify( myForm ) );

        const rawResponse = await fetch(url, {
            method : 'post',
            body: data
        }).then((response)=> {
            session_cookie = response.headers['set-cookie'];
            console.log('Session cookie: ' + session_cookie);
            console.log(response);
            return response.json();

        })
        .catch(function (err) {
            console.log("Something went wrong!", err);
        });

        const responseContent = await rawResponse;
        console.log("rawResponse: "+JSON.stringify(rawResponse));
    }

    async function getManagerDataAjax() {
        let url = 'https://leashtime.com/mmd-sitters.php';
        const options = {
            method: 'POST',
            //mode : 'same-origin',
            //credentials : 'same-origin',
            credentials : 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type' : 'application/json',
                //'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15'
            }
        }

        let response = await fetch(url, options);
        let sitterJSON = response.json();
        console.log('RESPONSE: ' + JSON.stringify(response));
        console.log('sitterJSON RESPONSE FOR LIST SITTERS: ' + sitterJSON);
        sitterList = sitterJSON.sitters;
        console.log('RESPONSE FOR LIST SITTERS: ' + sitterList);

    }