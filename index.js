// IMG_20170505_152547.jpg

const fs = require('fs');
const path = require('path');
const modifyExif = require('modify-exif');
const ExifImage = require('exif').ExifImage;
const { utimes } = require('utimes');

let sourceDirectory = `/Users/arjun/Downloads/Everything else/p/photos/test`;

const getFileNameFromDate = (date) => {
    return "IMG_" + date.split(":").join("").split(" ").join("_") + ".jpg";
}

const renameFile = (path, oldName, newName) => {
    fs.rename(`${path}/${oldName}`, `${path}/${newName}`, function (err) {
        if (err) console.log(`Error renaming ${oldName} to ${newName}`);
        else console.log("SUCCESS: ", oldName, ' to \t', newName);
    });
};

const getOriginalDate = (image) => new Promise((res, rej) => {
    try {
        new ExifImage({ image }, function (error, exifData) {
            if (error)
                rej(error.message);
            else {
                res(exifData.exif.DateTimeOriginal);
            }
        });
    } catch (error) {
        rej(error.message);
    }
});

const updateFileNameWithOriginalDate = async (fileName, index) => {
    const filePath = path.join(sourceDirectory, fileName);
    try {
        const date = await getOriginalDate(filePath);
        console.log(fileName, date);
        // renameFile(sourceDirectory, fileName, getFileNameFromDate(date));

        // const time = index < 10 ? `0${index}` : index;
        // const date = `IMG_20180803_1200${index}.jpg`;
        // console.log(date);
        // renameFile(sourceDirectory, fileName, date);
    } catch (e) {
        console.log(`Error while updating ${filePath}. ${e} `);
    }
}

const updateFileTimeAttr = (filePath, time) => {
    //Updating creation time
    utimes(filePath, {
        btime: time,
        mtime: time,
    });
}

const arr = [];
const folder = '2';
const map = new Map();

fs.readdir(sourceDirectory, async function (err, files) {
    if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }
    for (let index = 0; index < files.length; index++) {
        const fileName = files[index];
        const filePath = path.join(sourceDirectory, fileName);
        await new Promise((res) => {
            fs.stat(filePath, async function (error, stat) {
                if (error) {
                    console.error("Error stating file.", error);
                    return res();
                }
                const allowedFormats = [".jpg", ".JPG", ".jpeg", ".JPEG", ".png", ".PNG"];
                if (stat.isFile() && allowedFormats.some(ext => fileName.indexOf(ext) > -1) && fileName.indexOf('DS_Store') === -1) {
                    // console.log(fileName);
                    updateDate(sourceDirectory, fileName, index);
                    // arr.push(fileName);
                    // updateFileNameWithOriginalDate(fileName, index);
                    // const time = getTimeFromFileName(fileName);
                    // updateFileTimeAttr(filePath, time);
                    // console.log(fileName);
                } else {
                    console.log("ignoring file: ", fileName);
                    if (fileName.indexOf('MOV') > -1) {
                        if (map.has("MOV")) {
                            map.set("MOV", map.get("MOV") + 1)
                        } else
                            map.set("MOV", 1)
                    } else if (fileName.indexOf('NEF') > -1) {
                        if (map.has("NEF")) {
                            map.set("NEF", map.get("NEF") + 1)
                        } else {
                            // console.log("ignoring file: ", fileName);
                            map.set("NEF", 1)
                        }
                    }
                }
                setTimeout(res, 5);
            });
        });
    }
});
/* setTimeout(() => {
    console.log(map);
}, 10000) */
// setTimeout(() => {
// console.log(arr)
// fs.writeFile(`/Users/arjun/Downloads/p/mnet laptop backup/code/rename-files/${folder}.json`, JSON.stringify(arr), {}, () => { });
// }, 2000);



const getTimeFromFileName = (fileName) => {
    const temp = fileName.substring(4, 8) +
        '-' +
        fileName.substring(8, 10) +
        '-' +
        fileName.substring(10, 12) +
        'T' +
        fileName.substring(13, 15) +
        ':' +
        fileName.substring(15, 17) +
        ':' +
        fileName.substring(17, 19);
    return new Date(temp).getTime();
}

const updateDate = (sourceDirectory, fileName, index) => {
    const srcImagePath = `${sourceDirectory}/${fileName}`;
    let dateTaken = '2012:01:01 00:00:' + (Math.floor(Math.random() * 100) % 50 + 10);
    fs.readFile(srcImagePath, (error, data) => {
        if (!error) {
            try {
                const newBuffer = modifyExif(data, data => {
                    if (data.Exif['36867']) {
                        dateTaken = data.Exif['36867'];
                        console.log(fileName, " Date taken ", dateTaken);
                    } else {
                        console.log("Can't read EXIF", fileName);
                        const separator = '-';
                        const dateFromFile = "20210827";
                        // const dateFromFile = fileName.split(separator)[1];
                        // const dateFromFile = fileName.substring(3, 11);
                        dateTaken = dateFromFile.substring(0, 4) + ':' + dateFromFile.substring(4, 6) + ':' + dateFromFile.substring(6, 8);
                        // const seconds = fileName.split(separator)[2];
                        // dateTaken += " " + seconds.substring(0, 2) + ':' + seconds.substring(2, 4) + ':' + seconds.substring(4, 6);
                        const index1 = index + 1;
                        const seconds = index < 10 ? `0${index}` : index; // handle for index > 60
                        dateTaken += ` 05:00:${seconds}`;
                        data.Exif['36867'] = dateTaken;
                        // console.log(dateTaken);
                        // dateTaken += ' 12:00:' + fileName.split('-')[2].substring(4, 6);
                    }
                    return data;
                }, { keepDateTime: true });
                let newFileName = `IMG_${dateTaken.split(':').join('').replace(' ', '_')}.jpg`;
                // console.log(fileName, `${sourceDirectory}/processed/${newFileName}`);
                console.log(fileName, newFileName);
                // fs.writeFile(`${sourceDirectory}/processed/${newFileName}`, newBuffer, {}, () => { });
            } catch (e) {
                console.log("Exception", fileName, e);
                // fs.writeFile(`${sourceDirectory}/processed/${fileName}`, new Image(srcImagePath).data, {}, () => { });
                /* fs.rename(
                    `${sourceDirectory}/${fileName}`,
                    `${sourceDirectory}/exc${fileName}`,
                    () => {
                        console.log('Renamed ', fileName);
                    }); */
            }
        }
    });
}
