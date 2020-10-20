const _ = require('lodash');

const { layers, tilesets, width, height, offsetWidth, offsetHeight } = require('../dist/D717/d717001')
const result = _.map(layers, layer => layer.values).map(values => {
    return _.chunk(values, width).map((value, row) => {
        return _.map(value, (item, column) => {
            return { src: tilesets[item > 0 ? item - 1 : item].source, x: column * 32, y: row * 48 }
        })

    })
})