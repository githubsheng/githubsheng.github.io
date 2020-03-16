/**
 * think of this as a resources loader.
 * we load all resources and wait for them to finish and only after that we start the game. so we do not need to worry
 * about unloaded assets (eg. images) during the game.
 */

class NamedImageInfo {
    constructor(name, url) {
        this.name = name;
        this.url = url;
    }
}

const namedImagesInfos = [
    new NamedImageInfo('001', './img/001.png'),
    new NamedImageInfo('002', './img/002.png'),
    new NamedImageInfo('003', './img/003.png'),
    new NamedImageInfo('004', './img/004.png'),
    new NamedImageInfo('005', './img/005.png'),
    new NamedImageInfo('006', './img/006.png'),
    new NamedImageInfo('007', './img/007.png'),
    new NamedImageInfo('008', './img/008.png'),
    new NamedImageInfo('009', './img/009.png'),
    new NamedImageInfo('010', './img/010.png'),
    new NamedImageInfo('011', './img/011.png'),
    new NamedImageInfo('012', './img/012.png'),
    new NamedImageInfo('x2', './img/x2.png'),
    new NamedImageInfo('bonus', './img/bonus.png'),
    new NamedImageInfo('bonus2', './img/bonus2.png'),
    new NamedImageInfo('colorful_star', './sprite/colorful_star.png'),
    new NamedImageInfo('pink_star', './sprite/pink_star.png'),
    new NamedImageInfo('yellow_star', './sprite/yellow_star.png'),
];

function loadImage(info) {
    return new Promise((resolve, reject) => {
        const { url , name } = info;
        const img = new Image();
        const namedImage = {name, img};
        img.addEventListener("load", () => resolve(namedImage));
        img.addEventListener("error", err => reject(err));
        img.src = url;
    });
}

async function prepareImageAsset(){
    const imagesPromises = namedImagesInfos.map(info => loadImage(info));
    const namedImages = await Promise.all(imagesPromises);
    const imageAsset = new Map();
    namedImages.forEach(namedImage => {
        imageAsset.set(namedImage.name, namedImage.img);
    });
    return imageAsset;
}
