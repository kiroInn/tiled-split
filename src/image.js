const sizeOf = require('image-size');
const fs = require('fs');
const _ = require('lodash');

const dirName = '../images/';
function parseImages(dirName) {
    fs.readdir(dirName, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        const infoMap = _.reduce(filenames, (prev, filename) => {
            const { width, height } = sizeOf(`${dirName}${filename}`)
            const perfix = filename.substr(0, filename.length - 4)
            prev[perfix] = { width, height }
            return prev;
        }, {})
    });
}

parseImages(dirName)
module.exports = {
    parseImages: parseImages
}