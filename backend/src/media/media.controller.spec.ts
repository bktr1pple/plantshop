import { BadRequestException } from '@nestjs/common';
import { createMulterOptions, MediaController } from './media.controller';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaServiceMock: {
    list: jest.Mock;
    deleteByUrl: jest.Mock;
    validateUploads: jest.Mock;
    toUploadResponse: jest.Mock;
  };

  beforeEach(() => {
    mediaServiceMock = {
      list: jest.fn(),
      deleteByUrl: jest.fn(),
      validateUploads: jest.fn().mockResolvedValue(undefined),
      toUploadResponse: jest.fn(),
    };

    controller = new MediaController(mediaServiceMock as never);
  });

  type MediaUploadFiles = Parameters<MediaController['upload']>[0];
  type MediaUploadFile = MediaUploadFiles[number];

  it('list повертає items із сервісу', async () => {
    mediaServiceMock.list.mockResolvedValue([{ filename: 'leaf.png' }]);

    await expect(controller.list({ collection: 'plants' })).resolves.toEqual({
      items: [{ filename: 'leaf.png' }],
    });
    expect(mediaServiceMock.list).toHaveBeenCalledWith('plants');
  });

  it('upload кидає помилку без файлів', async () => {
    await expect(
      controller.upload([], { collection: 'plants' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('upload мапить завантажені файли в response', async () => {
    mediaServiceMock.toUploadResponse.mockImplementation(
      (collection: string, filename: string, size: number) => ({
        collection,
        filename,
        size,
      }),
    );

    const files: MediaUploadFiles = [
      {
        originalname: 'leaf.png',
        mimetype: 'image/png',
        filename: 'leaf.png',
        path: 'C:\\tmp\\leaf.png',
        size: 1234,
      } satisfies MediaUploadFile,
    ];

    await expect(
      controller.upload(files, { collection: 'plants' }),
    ).resolves.toEqual({
      items: [
        {
          collection: 'plants',
          filename: 'leaf.png',
          size: 1234,
        },
      ],
    });
    expect(mediaServiceMock.validateUploads).toHaveBeenCalledWith(files);
  });

  it('remove делегує видалення сервісу', async () => {
    mediaServiceMock.deleteByUrl.mockResolvedValue({ deleted: true });

    await expect(
      controller.remove({
        url: 'http://localhost:3001/uploads/plants/leaf.png',
      }),
    ).resolves.toEqual({ deleted: true });
    expect(mediaServiceMock.deleteByUrl).toHaveBeenCalledWith(
      'http://localhost:3001/uploads/plants/leaf.png',
    );
  });

  it('createMulterOptions задає file size limit і відхиляє не-image файли', () => {
    const options = createMulterOptions();
    const callback = jest.fn();
    type FileFilterFile = MediaUploadFile;
    const invalidFile: FileFilterFile = {
      originalname: 'notes.txt',
      mimetype: 'text/plain',
      filename: 'notes.txt',
      path: 'C:\\tmp\\notes.txt',
      size: 10,
    };

    expect(options.limits?.fileSize).toBe(5 * 1024 * 1024);

    options.fileFilter?.({ body: {} }, invalidFile as never, callback as never);

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false,
    );
  });
});
