import Resizer from 'react-image-file-resizer';

/**
 * Compress image file for upload
 * @param {File} file - Image file to compress
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = (file) => {
    return new Promise((resolve) => {
        Resizer.imageFileResizer(
            file,
            800, // max width
            800, // max height
            'JPEG', // output format
            80, // quality
            0, // rotation
            (uri) => {
                // Convert base64 to File
                fetch(uri)
                    .then((res) => res.blob())
                    .then((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    });
            },
            'base64' // output type
        );
    });
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {boolean} Whether file is valid
 */
export const isValidImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        alert('Solo se permiten imágenes JPG y PNG');
        return false;
    }

    if (file.size > maxSize) {
        alert('La imagen no debe superar 10MB');
        return false;
    }

    return true;
};
