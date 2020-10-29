export default [
    {
        name: 'circle',
        svgTag: 'circle',
        type: 'circular',
        parameters: [{ title: 'radius', svgAttribute: 'r' }]
    },
    {
        name: 'rectangle',
        svgTag: 'rect',
        type: 'non-circular',
        parameters: [
            { title: 'length', svgAttribute: 'width' },
            { title: 'breadth', svgAttribute: 'height' }
        ]
    },
    {
        name: 'square',
        svgTag: 'rect',
        type: 'non-circular',
        parameters: [
            { title: 'length', svgAttribute: 'width' },
            { title: 'breadth', svgAttribute: 'height' }
        ]
    },
    {
        name: 'ellipse',
        svgTag: 'ellipse',
        type: 'semi-circular',
        parameters: [
            { title: 'horizontal Radius', svgAttribute: 'rx' },
            { title: 'vertical Radius', svgAttribute: 'ry' }
        ]
    },
    {
        name: 'polygon',
        svgTag: 'polygon',
        type: 'non-circular',
        parameters: [{ title: 'Number of sides', svgAttribute: 'sides' }]
    }
]