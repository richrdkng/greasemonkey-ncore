function getRangeCategory(date, ranges) {
    var diff = (Date.now() - date) / (24 * 60 * 60 * 1000); // in days

    for (var k in ranges) {
        var range = ranges[k].range;

        if (isBetweenRange(diff, range)) {
            return range;
        }
    }

    return null;
}

function isBetweenRange(day, range) {
    var pattern = /^(\d+)[\s-]*(\d+)$/,
        matches = range.match(pattern),
        min     = parseInt(matches ? matches[1] : null),
        max     = parseInt(matches ? matches[2] : null);

    if (min === min && max === max) {
        return day >= min && day <= max;
    }

    return false;
}

var datetime = new Date('2016-03-10T12:00:00'),
    ranges   = [
    {
        range : '0 - 7', // days
        color : '#FFFFFF - #FF0000' // from white to red
    },
    {
        range : '8 - 14',
        color : '#FF0000 - #FFFFFF'
    },
    {
        range : '15 - 21',
        color : '#FF0000 - #FFFFFF'
    },
    {
        range : '22 - 9999',
        color : '#FF0000 - #FFFFFF'
    }
];

console.log(getRangeCategory(datetime, ranges));