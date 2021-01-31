const _ = require('lodash');

function extract(mapInfo, SPLIT) {
    // tileWith: 100,
    // tileHeight: 100,
    // isExtract: true,
    // tl: {
    //     x: 245,
    //     y: 130
    // },
    // tr: {
    //     x: 345,
    //     y: 130
    // },
    // bl: {
    //     x: 245,
    //     y: 30
    // },
    // br: {
    //     x: 345,
    //     y: 30
    // }
    const { tileWith, tileHeight, tr, bl } = SPLIT;
    mapInfo.map._attributes.height = tileHeight
    mapInfo.map._attributes.width = tileWith
    const map = _.get(mapInfo, 'map');
    map.layer = _.map(_.isArray(map.layer) ? map.layer : [map.layer], item => {
        const { width, height } = item._attributes;
        item._attributes.width = tileWith
        item._attributes.height = tileHeight
        const matrix = _.get(item, 'data._text').trim().replace(/\n/g, '')
        const text = _.flatten(_.chunk(matrix.split(',').map(item => parseInt(item, 10)), width).filter((item, index) => {
            const indexY = parseInt(height, 10) - index - 1;
            return indexY >= bl.y && indexY <= tr.y
        }).map(item => _.filter(item, (value, index) => index >= bl.x && index <= tr.x))).join(',')
        item.data._text = text;
        return item;
    })
    return mapInfo
}

module.exports = {
    extract: extract
}