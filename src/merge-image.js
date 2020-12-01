const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');
const fs = require('fs');
const _ = require('lodash');

const layerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
const mapWidth = 2;
const mapHeight = 5;
const width = mapWidth * 48
const height = mapHeight * 32
const infos = []
_.chunk(layerData, mapWidth).forEach((rowData, row) => {
    rowData.forEach((data, column) => {
        if(data > 0){
            infos.push({src: '../images/test.png', x: column*48, y: row*32})
        }
    })
})
mergeImages(infos, {
    width,
    height,
    Image,
    Canvas
})
    .then(b64 => {
        fs.writeFile(`./merge-images/test.png`, b64.replace(/^data:image\/png;base64,/, ""), 'base64', function (err) {
            if (err) return console.log(err);
            console.log(`image complete`);
        })
    });