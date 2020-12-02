/*eslint-disable*/
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const app = express();

const myLimit = typeof process.argv[2] !== 'undefined' ? process.argv[2] : '5mb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all('*', function (req, res, next) {
    // console.log(req.url, req.method, req.body, req.header)
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
    let headersToSend = {
        'Ocp-Apim-Subscription-Key': req.header('Ocp-Apim-Subscription-Key'),
    };
    if(req.url==="/drxauth/user/reset-rm"){
        headersToSend['source']="rm-ui"
    }else{
        headersToSend['Source']=req.header("Source")
        // headersToSend=req.headers
    }
    
    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        // console.log(headersToSend)
        request({ url: targetURL + req.url, method: req.method, json: req.body, headers: headersToSend },
            function (error, response, body) {
                if (error) {
                    console.error(error);
                    console.error('error: ' + response.statusCode)
                }
//                console.log(body);
            }).pipe(res);
    }
});

// app.get('/',(req,res)=>{
//     res.send("Successfully Connected")
// })

app.set('port', process.env.PORT || 8000);

app.listen(app.get('port'), function () {
    console.log(`Proxy server listening on port ${app.get('port')}`);
});
