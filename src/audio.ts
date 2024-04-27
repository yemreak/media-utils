import fs from "fs"
import OpenAI from "openai"
import type { TranscriptionCreateParams } from "openai/resources/audio/transcriptions"

export async function transcribeViaWhisper(
	path: string,
	apiKey: string,
	response_format: TranscriptionCreateParams["response_format"]
): Promise<string> {
	const openai = new OpenAI({ apiKey })
	const transcription = (await openai.audio.transcriptions.create({
		file: fs.createReadStream(path),
		model: "whisper-1",
		response_format,
	})) as any

	if (response_format === "json") return transcription.text
	return transcription
}
