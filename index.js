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
    const fileHost = './traefik-lb/traefik-dynamic.toml'
    const ipTCP = `[[http.services.service-http.loadBalancer.servers]]\nurl = "http://${IP}"`
    const ipUDP = `[[udp.services.service-udp.loadBalancer.servers]]\naddress = "${IP}:60246"`
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
            result = data.replace(/#udp/g ,ipUDP + '\n#udp');
            result = result.replace(/#tcp/g ,ipTCP + '\n#tcp');
            console.log('add IP: ', ipUDP, ipTCP)
        }
        console.log('result: ', result)
        fs.writeFile(fileHost, result, 'utf8', function (err) {
            if (err) return console.log(err);
            console.log('Change file traefik.toml success')
        });
    });
    res.status(200).send("Set traefik success");
});

/**
 * Server Activation
 */

app.listen(port, host, () => {
    console.log(`Listening to requests on http://${host}:${port}`);
});
