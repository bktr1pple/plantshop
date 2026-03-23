import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { ListMediaQueryDto } from './dto/list-media-query.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';
import {
  createStoredFilename,
  ensureUploadDirectories,
  getCollectionDir,
  normalizeMediaCollection,
} from './media-storage';

type MultipartRequest = Omit<Request, 'body'> & {
  body: {
    collection?: string;
  };
};

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  filename: string;
  size: number;
};
type DestinationCallback = (error: Error | null, destination: string) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;
type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

const createDiskStorage = diskStorage as unknown as (options: {
  destination: (
    req: MultipartRequest,
    file: UploadedImageFile,
    callback: DestinationCallback,
  ) => void;
  filename: (
    req: MultipartRequest,
    file: UploadedImageFile,
    callback: FilenameCallback,
  ) => void;
}) => NonNullable<MulterOptions['storage']>;

function buildStorageEngine(): NonNullable<MulterOptions['storage']> {
  return createDiskStorage({
    destination: (req, file, callback) => {
      void file;
      const collection = normalizeMediaCollection(req.body?.collection);
      callback(null, getCollectionDir(collection));
    },
    filename: (_req, file, callback) => {
      callback(null, createStoredFilename(file.originalname));
    },
  });
}

export function createMulterOptions(): MulterOptions {
  ensureUploadDirectories();
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    storage: buildStorageEngine() as unknown as NonNullable<
      MulterOptions['storage']
    >,
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 10,
    },
    fileFilter: (
      _req: MultipartRequest,
      file: UploadedImageFile,
      callback: FileFilterCallback,
    ) => {
      const isAllowedMime = file.mimetype.startsWith('image/');
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const extension = extname(file.originalname).toLowerCase();

      if (!isAllowedMime || !allowedExtensions.includes(extension)) {
        callback(
          new BadRequestException(
            'Дозволені лише зображення JPG, PNG, WEBP або GIF',
          ),
          false,
        );
        return;
      }

      callback(null, true);
    },
  };
}

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async list(@Query() query: ListMediaQueryDto) {
    return {
      items: await this.mediaService.list(query.collection),
    };
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, createMulterOptions()))
  upload(
    @UploadedFiles() files: UploadedImageFile[],
    @Body() dto: UploadMediaDto,
  ) {
    if (!files?.length) {
      throw new BadRequestException('Не вибрано жодного файлу');
    }

    const collection = normalizeMediaCollection(dto.collection);

    return {
      items: files.map((file) =>
        this.mediaService.toUploadResponse(
          collection,
          file.filename,
          file.size,
        ),
      ),
    };
  }

  @Delete()
  async remove(@Body() dto: DeleteMediaDto) {
    return this.mediaService.deleteByUrl(dto.url);
  }
}
