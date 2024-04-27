export async function uploadToImgur(
	imageData: Buffer | ArrayBuffer | string
): Promise<string> {
	const response = await fetch("https://api.imgur.com/3/image", {
		method: "POST",
		body: imageData,
		headers: {
			Authorization: "Client-ID dd32dd3c6aaa9a0",
			"Content-Type": "application/octet-stream",
		},
	})
	if (!response.ok) throw new Error(`Failed to upload image: ${response.statusText}`)

	const responseData = await response.json()
	return responseData.data.link
}
