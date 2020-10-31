const multer = require('multer');

const uploadAvatar = multer({
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            callback(new Error('Please upload a jpg, png or jpeg file!'));
            return;
        }

        callback(undefined, true);
    }
});

module.exports = uploadAvatar