import { Injectable } from '@nestjs/common';
import {
  AdminAndResourceOptions,
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import { IAttachmentType } from 'src/modules/category/category.interface';
interface CloudinaryResource {
  public_id: string;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
}
@Injectable()
export class CloudService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
      secure: true,
    });
  }

  async uploadFile(
    path: string,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    const file = await cloudinary.uploader.upload(path, options);
    return file;
  }

  async uploadFiles(
    files: Express.Multer.File[],
    options?: UploadApiOptions,
  ): Promise<IAttachmentType[] | []> {
    const attachments: IAttachmentType[] = [];
    for (const file of files) {
      const { public_id, secure_url } = await this.uploadFile(
        file.path,
        options,
      );
      attachments.push({ public_id, secure_url });
    }
    return attachments;
  }
  async destroyFile(public_id: string) {
    return await cloudinary.uploader.destroy(public_id);
  }

  async destroyFiles(
    public_ids: string[],
    options?: AdminAndResourceOptions,
  ): Promise<void> {
    // for (const public_id of public_ids) {
    //   await cloudinary.uploader.destroy(public_id);
    // }
    //or
    await cloudinary.api.delete_resources(
      public_ids,
      options || {
        type: 'upload',
        resource_type: 'image',
      },
    );
  }
  async destroyFolderAssets(folderPath: string) {
    try {
      // await cloudinary.api.delete_resources_by_prefix(folderPath);
      //or
      // Fetch all assets in the folder
      const resources = (await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath, // Fetch assets inside the folder
        max_results: 100, // Adjust as needed
      })) as CloudinaryResponse;

      const publicIds: string[] = resources.resources.map(
        (resource: IAttachmentType) => resource.public_id,
      );

      if (publicIds.length === 0) {
        console.log(`No assets found in the folder: ${folderPath}`);
        return;
      }

      // Delete all files in the folder
      for (const publicId of publicIds) {
        await cloudinary.uploader.destroy(publicId);
      }

      console.log(
        `Successfully deleted ${publicIds.length} assets in ${folderPath}`,
      );
    } catch (error) {
      console.error('Error deleting folder assets:', error);
    }
  }
}
