import polygons from "@/data/polygons";

export function generateCoordinates(documentHeight, documentWidth, { width, height }) {
    let posX, posY;
    posX = (Math.random() * (documentWidth - width)).toFixed();
    posY = (
        Math.random() *
        (documentHeight - Number(height ? height : width))
    ).toFixed();

    return [posX, posY];
}

export function polygonCoordinateGenerator(documentWidth, documentHeight, createdShape, polygonNumberOfSides) {

    let points = '';

    const bb = createdShape.getBBox();
    const bbw = bb.width;
    const bbh = bb.height;
    const initialPosX = (
        Math.random() *
        (documentWidth - 100 - bbw)
    ).toFixed();
    const initialPosY = (
        Math.random() *
        (documentHeight - 100 - bbh)
    ).toFixed();
    points += `${initialPosX},${initialPosY}`;
    const polygonShape = polygons.find(polygon => polygon.sides === Number(polygonNumberOfSides))
    polygonShape.sequence.reduce((acc, currentValue) => {
        if (!acc) {
            const coordinate = operation([initialPosX, initialPosY], 150, currentValue)
            points += ` ${coordinate[0]},${coordinate[1]}`
            return coordinate
        } else {
            const coordinate = operation(acc, 150, currentValue)
            points += ` ${coordinate[0]},${coordinate[1]}`
            return coordinate
        }
    }, null)
    console.log(points)
    return points;
}

function operation(previousValue, operationValue, currentSequence) {
    let posX, posY;

    if (currentSequence[0] === 'add') {
        posX = Number(previousValue[0]) + Number(operationValue)
    } else if (currentSequence[0] === 'equal') {
        posX = Number(previousValue[0])
    } else {
        posX = Number(previousValue[0]) - Number(operationValue)
    }

    if (currentSequence[1] === 'add') {
        posY = Number(previousValue[1]) + Number(operationValue)
    } else if (currentSequence[1] === 'equal') {
        posY = Number(previousValue[1])
    } else {
        posY = Number(previousValue[1]) - Number(operationValue)
    }
    return [posX, posY]
}