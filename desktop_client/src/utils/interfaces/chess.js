const CHESS_COM_ICON_URL = "https://discord.hb.ru-msk.vkcs.cloud/chess.jpg";
const BLITZ_ICON_URL = "https://discord.hb.ru-msk.vkcs.cloud/blitz.png";
const BULLET_ICON_URL = "https://discord.hb.ru-msk.vkcs.cloud/bullet.png";
const DAILY_ICON_URL = "https://discord.hb.ru-msk.vkcs.cloud/daily.png";
const RAPID_ICON_URL = "https://discord.hb.ru-msk.vkcs.cloud/rapid.png";
const ANALYSIS_ICON_URL = "https://discord.hb.ru-msk.vkcs.cloud/analysis.png";
const REVIEW_ICON_URL = "https://discord.hb.ru-msk.vkcs.cloud/review.png";

const STATUS_NONE = "none";
const STATUS_BLITZ = "blitz";
const STATUS_DAILY = "daily";
const STATUS_RAPID = "rapid";
const STATUS_BULLET = "bullet";
const STATUS_ANALYSIS = "analysis";
const STATUS_REVIEW = "review";

const getChessInterfaceInfo = (body) => {
    const { pageInterface, tab } = body;

    let info = {
        status: "Not in a Game",
        details: undefined,
        buttons: undefined,
        iconUrl: CHESS_COM_ICON_URL,
        customClientId: "chess",
    };

    if (!pageInterface.info) return info;
    if (!pageInterface.info.status) return info;

    const chessStatus = pageInterface.info.status;

    if (chessStatus === STATUS_ANALYSIS) {
        info.status = "Analyzing a Game";
        info.iconUrl = ANALYSIS_ICON_URL;
    } else if (chessStatus === STATUS_REVIEW) {
        info.status = "Reviewing a Game";
        info.iconUrl = REVIEW_ICON_URL;
    } else if (chessStatus === STATUS_BLITZ) {
        info.status = "Playing Blitz";
        info.iconUrl = BLITZ_ICON_URL;
    } else if (chessStatus === STATUS_RAPID) {
        info.status = "Paying Rapid";
        info.iconUrl = RAPID_ICON_URL;
    } else if (chessStatus === STATUS_DAILY) {
        info.status = "Playing Daily";
        info.iconUrl = DAILY_ICON_URL;
    } else if (chessStatus === STATUS_BULLET) {
        info.status = "Playing Bullet";
        info.iconUrl = BULLET_ICON_URL;
    }

    if (info.status === STATUS_NONE) {
        return info;
    }

    info.buttons = [
        {
            label: "Watch The Game",
            url: pageInterface.tabUrl,
        },
    ];

    return info;
};

module.exports = {
    getChessInterfaceInfo,
};
