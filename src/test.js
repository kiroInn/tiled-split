const _ = require('lodash');
const fs = require('fs');

const { layers, tilesets, width, height, offsetWidth, offsetHeight } = require('../dist/D717/d717001')
const result = _.map(layers, layer => {
    return {
        name: layer.name,
        values: _.flatten(_.chunk(layer.values, width).map((value, row) => {
            return _.map(value, (item, column) => {
                const { source, width, height } = tilesets[item > 0 ? item - 1 : item]
                return { src: source, x: column * 32, y: row * 48 + (48 - height) }
            })
        }))
    }
})

fs.writeFile(`../dist/test.js`, JSON.stringify(result), function (err) {
    if (err) return console.log(err);
    console.log(`test  complete`);
})