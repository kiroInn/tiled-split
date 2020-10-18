const _ = require('lodash');
const IMAGE_INFO = require('./image-info/index');

function cpSource(layer, layerMeta) {
    const matrix = [].concat.apply([], _.map(layer, item => item.matrix))
    return _.map(layerMeta, meta => {
        const { min, max, from, source } = meta;
        return `cp /Users/kiro/Src/cocos/mir2.core/src/${from}/{${_.union(matrix).filter(matrixItem => (matrixItem >= min && matrixItem < max)).map(item => item - min).map(item => `${item}.png`).join(',')}} /Users/kiro/Src/cocos/legend/client/assets/resources/tiled/${source}`
    }).join('&& \n');
}

function mapAg(layer, mapMeta) {
    const { width } = mapMeta;
    const { matrix } = _.find(layer, item => item.name === 'barrier') || {}
    return _.chunk(matrix, width).reverse().map(arr => arr.join(",")).join(",")
}

function split(layer, mapMeta) {
    const { width, height, chunkCol, chunkRow } = mapMeta;
    if (!(width || height || chunkCol || chunkRow)) {
        throw 'param is err please check'
    }
    const layerSplits = _.map(layer, layer => {
        const matrix = _.chunk(layer.matrix, width).map(arr => arr.join(",")).join(",").split(',')
        return _.range(0, chunkCol * chunkRow).map(index => {
            const intervalY = Math.ceil(height / chunkRow);
            const intervalX = Math.ceil(width / chunkCol);
            const newMatrix = _.range(0, intervalY).map(indexY => {
                const start = (index % chunkCol) * intervalX + (Math.floor(index / chunkRow) % chunkRow * intervalY + indexY) * width
                const max = (Math.floor(index / chunkRow) * intervalY + indexY) * width + width;
                const end = Math.min(start + intervalX, max);
                return matrix.slice(start, end).join(',');
            }).filter(item => item.length > 0);
            return {
                name: layer.name,
                matrix: newMatrix.join(",").split(","),
                width: _.get(newMatrix, '[0]').split(',').length,
                height: newMatrix.length,
            }
        })
    })
    return _.range(0, mapMeta.chunkCol * mapMeta.chunkRow).map(index => {
        return _.range(0, layer.length).map(layerIndex => {
            return layerSplits[layerIndex][index];
        })
    })
}

function transform(layer, layerMeta) {
    const matrix = [].concat.apply(['0'], _.map(layer, item => item.matrix))
    const { width, height } = _.get(layer, [0]);
    const allMap = _.sortBy(_.union(matrix))
    const tsx = `<tileset firstgid="1" name="saga-mir" columns="0">
                    <tile id="0">
                        <image width="96" height="64" source="../tiles/1950.png"/>
                    </tile>${_.map(layerMeta, meta => {
        const { min, max, source } = meta;
        return _.sortBy(_.union(matrix)).filter(item => (item >= min && item < max)).map(item => {
            const newValue = item - min;
            if(!_.has(IMAGE_INFO, `[${source}][${newValue}]`)){ console.error('can not find', source, newValue)}
            const {width = 1, height = 1} = IMAGE_INFO[source][newValue];
            return `<tile id="${allMap.indexOf(item)}">
                        <image width="${width}" height="${height}" source="../${source}/${newValue}.png"/>
                    </tile>`;
        }).join('')
    }).join('')}
    </tileset> `

    const matrixStr = _.map(_.filter(layer, item =>  item.name !== 'barrier'), item => {
        const { name, matrix } = item;
        const isBarrier = name === 'barrier';
        const newM = _.map(matrix, matrixItem => {
            if (isBarrier) return matrixItem;
            const newValue = allMap.indexOf(matrixItem);
            return matrixItem == 0 ? 0 : newValue + 1;
        });
        return `<layer name="${name}" width="${width}" height="${height}">
        <data encoding="csv">\n${_.chunk(newM, width).map(newItem => newItem.join(",")).join(',\n')}\n</data>
                </layer>`
    }).join(' ');
    return `<?xml version="1.0" encoding="UTF-8"?>
    <map version="1.0" orientation="orthogonal" width="${width}" height="${height}" tilewidth="48" tileheight="32" renderorder="right-down" infinite="0" nextobjectid="1">
    ${tsx}
    ${matrixStr}
    </map>`;
}

module.exports = {
    cpSource: cpSource,
    mapAg: mapAg,
    split: split,
    transform: transform,
}