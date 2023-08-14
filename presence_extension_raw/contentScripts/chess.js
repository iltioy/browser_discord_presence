const checkGameStatus = async () => {
    let status = "none";

    // Analysis
    const analysisGameReview = document.querySelector(
        ".game-review-buttons-review"
    );
    const analysisNewGame = document.querySelector(
        ".new-game-buttons-component"
    );
    if (analysisGameReview && analysisNewGame) {
        status = "analysis";
        return status;
    }

    // In Game
    const inGameResignButton = document.querySelector(
        ".resign-button-component"
    );
    const inGameBlitzIcon = document.querySelector(".blitz");
    const inGameRapidIcon = document.querySelector(".rapid");
    const inGameBulletIcon = document.querySelector(".bullet");
    const inGameDailyIcon = document.querySelector(".daily");
    if (inGameResignButton) {
        if (inGameBlitzIcon) {
            status = "blitz";
        } else if (inGameRapidIcon) {
            status = "rapid";
        } else if (inGameBulletIcon) {
            status = "bullet";
        } else if (inGameDailyIcon) {
            status = "daily";
        }

        return status;
    }

    // Review
    const reviewSearch = document.querySelector(".chess-board-search");
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get("tab") && reviewSearch) {
        status = "review";
    }

    return status;
};

const tabUrl = getTabUrl();

if (tabUrl.startsWith("chess.com")) {
    sleep(5000);
    setInterval(async () => {
        try {
            const status = await checkGameStatus();
            const storage = await chrome.storage.sync.get();
            let passTheSameUrl = false;

            const { interfaces } = storage;

            if (
                interfaces &&
                interfaces.chess &&
                interfaces.chess.lastSendStatus !== status
            ) {
                passTheSameUrl = true;
            }

            const message = {
                site: "chess.com",
                tabUrl: window.location.href,
                passTheSameUrl,
                info: {
                    status,
                },
            };

            await chrome.runtime.sendMessage(message);

            if (interfaces) {
                await chrome.storage.sync.set({
                    interfaces: {
                        ...interfaces,
                        chess: {
                            lastSendStatus: status,
                        },
                    },
                });
            }
        } catch (error) {
            console.log(error);
        }
    }, 5000);
}

console.log(getTabUrl());
