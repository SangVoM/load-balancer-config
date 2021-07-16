const express = require("express");
const fs = require("fs");
const bodyParser = require('body-parser');

const app = express();
const port = "8000";
const host = "127.0.0.1";

const shell = require('shelljs');
/**
 * Routes Definitions
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/", (req, res) => {
    const { IP, flag } = req.body;
    const fileHost = '/etc/nginx/conf.d/default.conf'
    const ipTCP = `server ${IP}:3005;`
    const ipUDP = `server ${IP}:60246;`
    let result = null

    fs.readFile(fileHost, 'utf8', function (err,data) {
        if (err) return console.log(err);
        /** Delete ip server **/
        if (flag) {
            if (data.indexOf('#tcp') !== -1 && data.indexOf('#udp') !== -1) {
                result = data.replace(ipTCP, "");
                result = result.replace(ipUDP , '');
            } else {
                result = data.replace(ipTCP, '#tcp');
                result = result.replace(ipUDP, '#udp');
            }
            console.log('delete IP:', ipTCP, ipUDP)
        } else { /** Add ip server **/
            result = data.replace(/#udp/g , ipTCP + '\n #udp');
            result = result.replace(/#tcp/g , ipUDP + '\n #tcp');
            console.log('add IP: ', ipUDP, ipTCP)
        }
        fs.writeFile(fileHost, result, 'utf8', function (err) {
            if (err) return console.log(err);
            console.log('start reload nginx')
            shell.exec("sudo /etc/init.d/nginx reload")
        });
    });
    res.status(200).send("SET HOST success");
});

/**
 * Server Activation
 */

app.listen(port, host, () => {
    console.log(`Listening to requests on http://${host}:${port}`);
});
