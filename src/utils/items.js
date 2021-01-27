function makeId(length = 10) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getRandomColor() {
    var r = function () {
        return Math.floor(Math.random() * 256)
    };
    return "rgba(" + r() + "," + r() + "," + r() + ", 0.6)";
}

export const createItem = (seed) => {
    const createdAt = 2 + Math.floor(Math.random() * seed);

    return {
        id: makeId(),
        reactions: Math.floor(Math.random() * 10 * createdAt),
        comments: Math.floor(Math.random() * 5 * createdAt),
        createdAt,
        updatedAt: Math.floor(Math.random() * createdAt),
        color: getRandomColor()
    };
}
