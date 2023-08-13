const getTabUrl = () => {
    let tabUrl = window.location.href.split("://")[1];
    if (tabUrl.startsWith("www.")) {
        tabUrl = tabUrl.slice(4);
    }

    return tabUrl;
};

const sleep = async (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};
