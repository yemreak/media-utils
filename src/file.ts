import fs from "fs"
import mime from "mime-types"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

/**
 * Uploads a file to an AWS S3 bucket.
 *
 * @param region - The AWS region where the S3 bucket is hosted.
 * @param filepath - The local path to the file to be uploaded.
 * @param s3BucketName - The name of the S3 bucket where the file will be uploaded.
 * @param publicRead - Optional. If set to true, the uploaded file will be publicly readable. Defaults to true.
 * @returns The response from the S3 service as a Promise.
 *
 * @example
 * ```typescript
 * async function main() {
 *     const region = 'us-east-1';
 *     const filepath = './data/image.png';
 *     const bucketName = 'my-s3-bucket';
 *     const isPublic = true;
 *
 *     try {
 *         const uploadResult = await uploadFileToS3(region, filepath, bucketName, isPublic);
 *         console.log('File uploaded successfully:', uploadResult);
 *     } catch (error) {
 *         console.error('Failed to upload file:', error);
 *     }
 * }
 *
 * main();
 * ```
 */
export async function uploadFileToS3(
	region: string,
	filepath: string,
	s3BucketName: string,
	publicRead: boolean = true
) {
	const file = fs.readFileSync(filepath)
	const filename = filepath.split("/").pop()
	const mimeType = mime.lookup(filepath) || "application/octet-stream"

	const client = new S3Client({ region })
	const command = new PutObjectCommand({
		Bucket: s3BucketName,
		Key: `${Date.now()}_${filename}`,
		Body: file,
		ContentType: mimeType,
		ACL: publicRead ? "public-read" : "private",
	})

	const response = await client.send(command)
	return response
}

export function retrieveFilenameFromURL(url: string): string {
	return url.split("?")[0].split("/").pop()!
}

export async function downloadFile(url: string, outputPath: string): Promise<void> {
	const response = await fetch(url)
	if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`)

	const buffer = await response.arrayBuffer()
	fs.writeFileSync(outputPath, Buffer.from(buffer))
}
