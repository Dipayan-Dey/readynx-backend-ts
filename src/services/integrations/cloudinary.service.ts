import cloudinary from "../../config/cloudinary";
import { ICloudinaryUploadResult } from "../../@types/interfaces/services.interface";

export const uploadResumeToCloudinary = async (
  fileBuffer: Buffer,
  filename: string,
): Promise<ICloudinaryUploadResult> => {
  try {
    // Validate Cloudinary configuration
    if (
      !process.env.CLOUD_NAME ||
      !process.env.CLOUD_API_KEY ||
      !process.env.CLOUD_API_SECRET
    ) {
      throw new Error(
        "Cloudinary configuration is missing. Please check environment variables: CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET",
      );
    }

    const result = await new Promise<ICloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "resumes",
            resource_type: "auto",
            public_id: `resume_${Date.now()}_${filename.replace(/\.[^/.]+$/, "")}`,
            format: filename.endsWith(".pdf") ? "pdf" : "docx",
          },
          (error, result) => {
            if (error) {
              console.error("[Cloudinary Upload Error]", error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                resourceType: result.resource_type,
              });
            } else {
              reject(new Error("Cloudinary upload failed: No result returned"));
            }
          },
        );

        uploadStream.end(fileBuffer);
      },
    );

    return result;
  } catch (error) {
    console.error("[Cloudinary Service Error]", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to upload resume to Cloudinary: ${error.message}`,
      );
    }
    throw new Error("Failed to upload resume to Cloudinary: Unknown error");
  }
};

export const deleteResumeFromCloudinary = async (
  resumeUrl: string,
): Promise<void> => {
  try {
    // Validate Cloudinary configuration
    if (
      !process.env.CLOUD_NAME ||
      !process.env.CLOUD_API_KEY ||
      !process.env.CLOUD_API_SECRET
    ) {
      throw new Error(
        "Cloudinary configuration is missing. Please check environment variables: CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET",
      );
    }

    const urlParts = resumeUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
      throw new Error("Invalid Cloudinary URL format");
    }

    const pathAfterUpload = urlParts.slice(uploadIndex + 1);

    const startIndex = pathAfterUpload[0].match(/^v\d+$/) ? 1 : 0;

    const publicIdWithExtension = pathAfterUpload.slice(startIndex).join("/");
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

    if (!publicId) {
      throw new Error("Could not extract public ID from URL");
    }

    console.log(`[Cloudinary Delete] Attempting to delete: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });

    console.log(`[Cloudinary Delete] Result:`, result);

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
  } catch (error) {
    console.error("[Cloudinary Delete Error]", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to delete resume from Cloudinary: ${error.message}`,
      );
    }
    throw new Error("Failed to delete resume from Cloudinary: Unknown error");
  }
};
