const { getChessInterfaceInfo } = require("./chess.js");

const customInterfaces = ["chess.com"];

const getCustomInterfaceInfo = (body) => {
    const { pageInterface } = body;
    if (pageInterface.site === "chess.com") {
        return getChessInterfaceInfo(body);
    }
};

module.exports = {
    customInterfaces,
    getCustomInterfaceInfo,
};
