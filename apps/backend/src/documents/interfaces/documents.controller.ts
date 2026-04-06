import { Injectable, BadRequestException, UseInterceptors, Controller, Post, Get, Delete, Param, UseGuards, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService, DocumentResponse, UploadDocumentInput } from '../application/documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const unique = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, unique);
      },
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document' })
  async upload(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const input: UploadDocumentInput = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };

    return this.documentsService.upload(user.id, user.tenantId, input);
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  async list(@CurrentUser() user: CurrentUserPayload): Promise<DocumentResponse[]> {
    return this.documentsService.list(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document' })
  async get(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<DocumentResponse> {
    return this.documentsService.get(id, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  async delete(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.documentsService.delete(id, user.tenantId);
  }
}