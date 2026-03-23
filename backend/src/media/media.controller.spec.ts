import { BadRequestException } from '@nestjs/common';
import { createMulterOptions, MediaController } from './media.controller';

describe('MediaController', () => {
  let controller: MediaController;
  let mediaServiceMock: {
    list: jest.Mock;
    deleteByUrl: jest.Mock;
    toUploadResponse: jest.Mock;
  };

  beforeEach(() => {
    mediaServiceMock = {
      list: jest.fn(),
      deleteByUrl: jest.fn(),
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

  it('upload кидає помилку без файлів', () => {
    expect(() => controller.upload([], { collection: 'plants' })).toThrow(
      BadRequestException,
    );
  });

  it('upload мапить завантажені файли в response', () => {
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
        size: 1234,
      } satisfies MediaUploadFile,
    ];

    expect(controller.upload(files, { collection: 'plants' })).toEqual({
      items: [
        {
          collection: 'plants',
          filename: 'leaf.png',
          size: 1234,
        },
      ],
    });
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
    type FileFilterRequest = {
      body: {
        collection?: string;
      };
    };
    type FileFilterFile = MediaUploadFile;
    const invalidFile: FileFilterFile = {
      originalname: 'notes.txt',
      mimetype: 'text/plain',
      filename: 'notes.txt',
      size: 10,
    };

    expect(options.limits?.fileSize).toBe(5 * 1024 * 1024);

    options.fileFilter?.(
      { body: {} } as never as FileFilterRequest,
      invalidFile as never,
      callback as never,
    );

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false,
    );
  });
});
