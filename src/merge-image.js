const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
const fs = require('fs');


mergeImages(['../images/test.png', '../images/test2.png'], {
    width: 1280,
    height: 1280,
    Image,
    Canvas
  })
    .then(b64 => {
        console.log(typeof b64)
        fs.writeFile(`./merge-images/test.png`, b64.replace(/^data:image\/png;base64,/, ""), 'base64', function (err) {
            if (err) return console.log(err);
            console.log(`image complete`);
        })
        // const img = new Image()
        // img.src = b64;
    });