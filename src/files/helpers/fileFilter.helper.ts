import { Request } from 'express';

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp'];

  if (!allowedExtensions.includes(fileExtension)) {
    return callback(new Error('Invalid file type'), false);
  }
  if (file.size > 5 * 1024 * 1024) {
    return callback(new Error('File size exceeds 5MB'), false);
  }

  callback(null, true);
};
