const sizeOf = require('image-size');
const fs = require('fs');
const _ = require('lodash');

const base = '/Users/kiro/Src/cocos/mir2.core/src/';
const source = 'smtiles';
const dirName = `${source}.wil`;
function parseImages(dirName) {
    fs.readdir(dirName, function (err, filenames) {
        if (err) {
            console.log(err);
            return;
        }
        const infoMap = _.reduce(filenames, (prev, filename) => {
            if (filename.indexOf('.png') > -1) {
                const { width, height } = sizeOf(`${dirName}${filename}`)
                const prefix = filename.substr(0, filename.length - 4)
                prev[prefix] = { width, height }
            }
            return prev;
        }, {})
        fs.writeFile(`./image-info/${source}.js`, `module.exports = ${JSON.stringify(infoMap)}`, function (err) {
            if (err) return console.log(err);
        })
    });
}
parseImages(`${base}${dirName}/`)
module.exports = {
    parseImages: parseImages
}