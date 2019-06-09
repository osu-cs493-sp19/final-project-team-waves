const fs = require("fs");

exports.removeFile = (filepath) => {
    return new Promise((res, rej) => {
        fs.unlink(filepath, (err) => {
            if (err)
                rej(err);

            else
                res();
        });
    });
};
