import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Request } from 'tsoa';
import { injectable } from 'tsyringe';
import { TemplateService } from '../services/template.service';
import { AppTemplate } from '../models/template';
import { NRequest } from '../../shared/interfaces/NRequest.interface';

interface CreateTemplateRequest {
  sourceAppId: string;
  name: string;
  description?: string;
  category?: string;
}

interface InstantiateTemplateRequest {
  name: string;
}

interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  thumbnail?: string | null;
  public?: boolean;
  verified?: boolean;
  editorChoice?: boolean;
}

@Route('/api/templates')
@Tags('Templates')
@injectable()
export class TemplateController extends Controller {

  constructor(
    private readonly templateService: TemplateService
  ) {
    super();
  }

  @Post()
  public async create(
    @Request() request: NRequest,
    @Body() body: CreateTemplateRequest
  ): Promise<AppTemplate> {
    if (request.user.anonymous) {
      this.setStatus(401);
      throw new Error('Authentication required');
    }

    return await this.templateService.createTemplate(
      body.sourceAppId,
      body.name,
      body.description || '',
      body.category || '',
      request.user.uuid
    );
  }

  @Get()
  public async findAll(
    @Request() request: NRequest
  ): Promise<AppTemplate[]> {
    const userId = request.user.anonymous ? '' : request.user.uuid;
    return await this.templateService.findAll(userId);
  }

  @Get('{id}')
  public async findById(
    @Path() id: string
  ): Promise<AppTemplate> {
    return await this.templateService.findById(id);
  }

  @Post('{id}/instantiate')
  public async instantiate(
    @Request() request: NRequest,
    @Path() id: string,
    @Body() body: InstantiateTemplateRequest
  ): Promise<{ uuid: string; name: string }> {
    if (request.user.anonymous) {
      this.setStatus(401);
      throw new Error('Authentication required');
    }

    return await this.templateService.instantiate(id, body.name, request.user.uuid);
  }

  @Put('{id}')
  public async update(
    @Request() request: NRequest,
    @Path() id: string,
    @Body() body: UpdateTemplateRequest
  ): Promise<AppTemplate> {
    if (request.user.anonymous) {
      this.setStatus(401);
      throw new Error('Authentication required');
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.public !== undefined) updateData.public = body.public;
    if (body.verified !== undefined) updateData.verified = body.verified;
    if (body.editorChoice !== undefined) updateData.editorChoice = body.editorChoice;

    return await this.templateService.update(id, updateData);
  }

  @Delete('{id}')
  public async delete(
    @Request() request: NRequest,
    @Path() id: string
  ): Promise<AppTemplate> {
    if (request.user.anonymous) {
      this.setStatus(401);
      throw new Error('Authentication required');
    }

    return await this.templateService.delete(id);
  }
}
