const RED   = 1,
      GREEN = 2,
      BLUE  = 3;

function getColorComponent(hex, component) {
    var pattern = /^#?(?:0x)?([\da-f]+)$/i,
        sanitized,
        matches;

    if (typeof hex === 'string') {
        matches = hex.match(pattern);

        if (matches && matches[1]) {
            sanitized = parseInt(matches[1], 16);

            if (sanitized !== sanitized) {
                sanitized = null;
            }
        }

    } else if (
        typeof hex === 'number' &&
        hex === hex &&
        hex >= 0 &&
        hex <= Infinity
        ) {

        sanitized = hex;
    }

    if (sanitized !== null) {
        switch (component) {
            case RED:
                return sanitized >> 16 & 0xFF;

            case GREEN:
                return sanitized >> 8 & 0xFF;

            case BLUE:
                return sanitized & 0xFF;
        }
    }

    return 0;
}

function getColorComponentGradient(colorComponent1, colorComponent2, percent) {
    return colorComponent1 + Math.round((colorComponent2 - colorComponent1) * percent);
}

function getHexComponent(colorComponent) {
    var hexComponent;

    if (colorComponent < 0) {
        colorComponent = 0;

    } else if (colorComponent > 255) {
        colorComponent = 255;
    }

    hexComponent = colorComponent.toString(16);

    if (colorComponent <= 0x0F) {
        hexComponent = '0' + hexComponent;
    }

    return hexComponent;
}

function getColorGradient(color1, color2, percent) {
    var c1_red   = getColorComponent(color1, RED),
        c1_green = getColorComponent(color1, GREEN),
        c1_blue  = getColorComponent(color1, BLUE),
        c2_red   = getColorComponent(color2, RED),
        c2_green = getColorComponent(color2, GREEN),
        c2_blue  = getColorComponent(color2, BLUE),
        red      = getColorComponentGradient(c1_red, c2_red, percent),
        green    = getColorComponentGradient(c1_green, c2_green, percent),
        blue     = getColorComponentGradient(c1_blue, c2_blue, percent);

    return '#' +
           getHexComponent(red) +
           getHexComponent(green) +
           getHexComponent(blue);
}

console.log(getColorComponent('0xAABBCC', RED).toString(16));
console.log(getColorComponent('0xAABBCC', GREEN).toString(16));
console.log(getColorComponent('0xAABBCC', BLUE).toString(16));

console.log(getColorComponentGradient(0x00, 0xFF, .5));

console.log(getHexComponent(0x09));

console.log(getColorGradient(0x000000, 0xFFFFFF, .5));