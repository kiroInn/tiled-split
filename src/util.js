const _ = require('lodash');
const IMAGE_INFO = require('./image-info/index');

function cpSource(layer, layerMeta) {
    const matrix = [].concat.apply([], _.map(layer, item => item.matrix))
    return _.map(layerMeta, meta => {
        const { min, max, from, source } = meta;
        return `cp /Users/kiro/Src/cocos/mir2.core/src/${from.replace('.tsx', '.wil')}/{${_.union(matrix).filter(matrixItem => (matrixItem >= min && matrixItem < max)).map(item => item - min).map(item => `${item}.png`).join(',')}} /Users/kiro/Src/cocos/legend/client/assets/resources/tiled/${source}`
    }).join('&& \n');
}

function mapAg(layer, mapMeta) {
    const { width, height } = mapMeta;
    const { matrix } = _.find(layer, item => item.name === 'barrier') || {}
    return `${width},${height},${_.chunk(matrix, width).reverse().map(arr => arr.join(",")).join(",")}`
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
                   ${_.map(layerMeta, meta => {
        const { min, max, source } = meta;
        return _.sortBy(_.union(matrix)).filter(item => (item >= min && item < max)).map(item => {
            const newValue = item - min;
            if (!_.has(IMAGE_INFO, `[${source}][${newValue}]`)) { console.error('can not find', source, newValue) }
            const { width = 1, height = 1 } = IMAGE_INFO[source][newValue];
            return `<tile id="${allMap.indexOf(item)}">
                        <image width="${width}" height="${height}" source="../${source}/${newValue}.png"/>
                    </tile>`;
        }).join('')
    }).join('')}
    </tileset> `

    const matrixStr = _.map(_.filter(layer, item => item.name !== 'barrier'), item => {
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

function transformJS(layer, layerMeta) {
    const matrix = [].concat.apply(['0'], _.map(layer, item => item.matrix))
    const { width, height } = _.get(layer, [0]);
    const allMap = _.sortBy(_.union(matrix))
    const tilesets = [{ id: 0, source: '', width: 96, height: 64 }];
    const tsx = _.forEach(layerMeta, meta => {
        const { min, max, source } = meta;
        _.sortBy(_.union(matrix)).filter(item => (item >= min && item < max)).forEach(item => {
            const newValue = item - min;
            if (!_.has(IMAGE_INFO, `[${source}][${newValue}]`)) { console.error('can not find', source, newValue) }
            const { width = 1, height = 1 } = IMAGE_INFO[source][newValue];
            tilesets.push({ id: allMap.indexOf(item), source: `tiled/${source}/${newValue}`, width, height })
        })
    })
    const layers = _.map(_.filter(layer, item => item.name !== 'barrier'), item => {
        const { name, matrix } = item;
        const isBarrier = name === 'barrier';
        return {
            name: name, values: _.map(matrix, matrixItem => {
                if (isBarrier) return matrixItem;
                const newValue = allMap.indexOf(matrixItem);
                return matrixItem == 0 ? 0 : newValue + 1;
            })
        }
    });
    const offsetWidth = Math.max(..._.map(tilesets, tiled => tiled.width)) - 48
    const offsetHeight = Math.max(..._.map(tilesets, tiled => tiled.height)) - 32
    const result = _.flatten(_.map(layers, layer => {
        const newValues = _.flatten(_.chunk(layer.values, width).map((value, row) => {
            return _.map(value, (item, column) => {
                const { source, width, height } = item === 0 ? tilesets[0] : _.find(tilesets, tile => tile.id === item - 1);
                return { id: item, src: source, x: column * 48, y: row * 32 + (32 - height) + offsetHeight }
            })
        }));
        return {
            name: layer.name,
            values: _.flatten(_.chunk(newValues, width)).filter(item => item.id !== 0)
        }
    }).map(layer => layer.values))
    return `
    module.exports = {
        width:${width},
        height:${height},
        offsetWidth:${offsetWidth},
        offsetHeight:${offsetHeight},
        values: ${JSON.stringify(result)}
    }`;
}

module.exports = {
    cpSource: cpSource,
    mapAg: mapAg,
    split: split,
    transform: transform,
    transformJS: transformJS,
}