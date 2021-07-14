const express = require("express");
const fs = require("fs");
const bodyParser = require('body-parser');

const app = express();
const port = "8000";

const shell = require('shelljs');
/**
 * Routes Definitions
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/", (req, res) => {
    const { IP, flag } = req.body;
    const fileHost = '/etc/nginx/conf.d/default.conf'
    const ipReplace = `server ${IP};`
    let result = null
    fs.readFile(fileHost, 'utf8', function (err,data) {
        if (err) return console.log(err);
        if (flag) result = data.replace(ipReplace, '#no');
         else result = data.replace(/#no/g , ipReplace + '\n #no');
        console.log('result: ', result)
        fs.writeFile(fileHost, result, 'utf8', function (err) {
            if (err) return console.log(err);
            shell.exec("sudo /etc/init.d/nginx reload")
        });
    });
    res.status(200).send("SET HOST success");
});

/**
 * Server Activation
 */

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});
