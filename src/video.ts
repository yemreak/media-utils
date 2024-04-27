import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import path from "path"
import YTDlpWrap from "yt-dlp-wrap"
import { vttToPlainText } from "./text"

ffmpeg.setFfmpegPath(ffmpegPath)

/**
 * Extracts audio from a video file and saves it as an MP3 file.
 * @param videoFilePath - The path to the video file.
 * @param outputAudioPath - The path where the extracted audio file should be saved.
 */
export async function extractAudioFromVideo(
	videoFilePath: string,
	outputAudioPath: string
): Promise<void> {
	if (fs.existsSync(outputAudioPath)) {
		console.log(`Audio already extracted: "${outputAudioPath}"`)
		return
	}

	return new Promise((resolve, reject) => {
		ffmpeg(videoFilePath)
			.toFormat("mp3")
			.on("end", () => {
				console.log(`Extraction completed: ${outputAudioPath}`)
				resolve()
			})
			.on("error", err => {
				console.error(`Error extracting audio: ${err.message}`)
				reject(err)
			})
			.save(outputAudioPath)
	})
}

/**
 * Extracts a frame from a video at a specified timestamp and saves it as a JPEG image.
 * @param videoPath The path to the video file.
 * @param outputPath The directory where the output JPEG should be saved.
 * @param timestamp The timestamp in the video to extract the frame (e.g., "00:00:01.000").
 * @returns The path to the saved JPEG image.
 */
export async function extractFrameFromVideo(
	videoPath: string,
	outputPath: string,
	timestamp: string
): Promise<string> {
	const filename = videoPath.replace(".mp4", ".jpeg").split("/").pop()!
	return new Promise((resolve, reject) => {
		ffmpeg(videoPath)
			.screenshots({
				timestamps: [timestamp],
				filename: filename,
				folder: outputPath,
			})
			.on("end", () => {
				console.log("Image successfully extracted and saved.")
				resolve(path.join(outputPath, filename))
			})
			.on("error", err => {
				console.error("An error occurred:", err.message)
				reject(err)
			})
	})
}

export async function downloadYtDlpIfNeeded(ytdlpPath: string) {
	if (!fs.existsSync(ytdlpPath)) await YTDlpWrap.downloadFromGithub(ytdlpPath)
}

export async function downloadVideoViaYtDlp(params: {
	url: string
	ytDlpPath?: string
	outdir?: string
	login?: { username: string; password: string }
	cookie?: { cookieFilePath: string }
	ytDlp?: YTDlpWrap
}) {
	const { url, cookie, login, ytDlpPath, outdir = "." } = params

	const ytDlp = params.ytDlp ?? new YTDlpWrap(ytDlpPath)
	const pattern = "%(playlist_index)s-%(channel)s-%(id)s.%(ext)s"
	const output = path.join(outdir, pattern)

	try {
		const stdout = await ytDlp.execPromise([
			url,
			"-f b",
			"--output",
			output,
			...generateAuthArg({ cookie, login }),
		])
		console.log(stdout)
	} finally {
		return fs.readdirSync(outdir).map(filename => {
			const [index, channel, id, ext] = filename.split("-")
			return {
				index: parseInt(index),
				channel,
				id,
				path: `${outdir}/${filename}`,
			}
		})
	}
}

function generateAuthArg(params: {
	login?: { username: string; password: string }
	cookie?: { cookieFilePath: string }
}) {
	const { cookie, login } = params
	return cookie
		? ["--cookies", cookie.cookieFilePath]
		: login
		? ["-u", login.username, "-p", login.password]
		: []
}

export async function fetchVideoInfoViaYtDlp(params: {
	url: string
	ytDlpPath?: string
	login?: { username: string; password: string }
	cookie?: { cookieFilePath: string }
	ytDlp?: YTDlpWrap
}) {
	const { url, cookie, login, ytDlpPath } = params

	const ytDlp = params.ytDlp ?? new YTDlpWrap(ytDlpPath)
	const stdout = await ytDlp.execPromise([
		url,
		"--dump-json",
		...generateAuthArg({ cookie, login }),
	])
	return JSON.parse(stdout)
}

export async function fetchDetailedInfoViaYtDlp(params: {
	url: string
	ytDlpPath?: string
	login?: { username: string; password: string }
	cookie?: { cookieFilePath: string }
	ytDlp?: YTDlpWrap
}): Promise<{
	title: string
	channel: string
	subtitle: string
	url: string
}> {
	const { url, cookie, login, ytDlpPath } = params

	const ytDlp = params.ytDlp ?? new YTDlpWrap(ytDlpPath)
	const info = await fetchVideoInfoViaYtDlp({ url, cookie, login, ytDlp })
	const stdout = await ytDlp.execPromise([
		url,
		"--skip-download",
		"--write-sub",
		"--write-auto-subs",
		"--sub-lang",
		"en",
		"--sub-format",
		"vtt",
		"--output",
		info.filename,
		...generateAuthArg({ cookie, login }),
	])
	console.log(stdout)

	const subtitle = vttToPlainText(`${info.filename}.en.vtt`)
	fs.unlinkSync(`${info.filename}.en.vtt`)

	return {
		subtitle,
		title: info.fulltitle,
		channel: info.channel,
		url: info.original_url,
	}
}
