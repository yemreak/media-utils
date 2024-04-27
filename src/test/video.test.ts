import path from "path"
import { extractFrameFromVideo } from "../video"

describe("extractFrameFromVideo", () => {
	it("should resolve with the output path on successful extraction", async () => {
		const videoPath = "video.mp4"
		const outputPath = "output"
		const timestamp = "00:00:01.000"

		const result = await extractFrameFromVideo(videoPath, outputPath, timestamp)
		expect(result).toBe("mocked/path/to/image.jpeg")
		expect(path.join).toHaveBeenCalledWith(outputPath, "video.jpeg")
	})

	it("should reject with an error on failure", async () => {
		expect.assertions(1)

		const videoPath = "video.mp4"
		const outputPath = "output"
		const timestamp = "00:00:01.000"

		try {
			await extractFrameFromVideo(videoPath, outputPath, timestamp)
		} catch (err) {
			expect(err).toEqual(new Error("Test error"))
		}
	})
})
