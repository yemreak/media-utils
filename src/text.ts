import { execSync } from "child_process"
import { readFileSync } from "fs"

/**
 * Translates text using the DeepL API.
 * @param text The text to be translated.
 * @param targetLang The target language code (e.g., "DE", "FR").
 * @param apiKey Your DeepL API authorization key.
 * @returns The translated text as a string.
 */
export async function translateTextViaDeepL(
	text: string,
	targetLang: string,
	apiKey: string
): Promise<string> {
	try {
		const response = await fetch("https://api-free.deepl.com/v2/translate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `DeepL-Auth-Key ${apiKey}`,
			},
			body: JSON.stringify({ text: [text], target_lang: targetLang }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		if (data.translations && data.translations.length > 0) {
			return data.translations[0].text
		} else {
			throw new Error("No translation received from the API.")
		}
	} catch (error) {
		console.error("Error translating text:", error)
		throw error
	}
}

/**
 * Splits a given text into an array of paragraphs, ensuring that no paragraph exceeds a specified maximum character count.
 * @param text The input text to be split into paragraphs.
 * @param maxChars The maximum number of characters allowed in a single paragraph.
 * @returns An array of strings, where each string is a paragraph that does not exceed the maximum character length.
 */
export function splitTextIntoParagraphs(text: string, maxChars: number): string[] {
	if (text.length <= maxChars) return [text]

	const paragraphs: string[] = []
	const lines = text.split("\n")

	let currentParagraph = ""
	for (const line of lines) {
		if (currentParagraph.length + line.length > maxChars) {
			const words = line.split(" ")
			for (const word of words) {
				if (currentParagraph.length + word.length + 1 > maxChars) {
					// Include space in length calculation
					paragraphs.push(currentParagraph.trim())
					currentParagraph = word + " "
				} else {
					currentParagraph += word + " "
				}
			}
		} else {
			currentParagraph += line + "\n"
		}
	}

	if (currentParagraph.length > 0) {
		paragraphs.push(currentParagraph.trim())
	}

	return paragraphs
}

/**
 * Converts a WebVTT (.vtt) file to plain text, stripping out all metadata, timestamps, and tags.
 * @param vttPath The file path to the WebVTT file.
 * @returns The content of the VTT file as plain text.
 */
export function vttToPlainText(vttPath: string): string {
	const content = readFileSync(vttPath, "utf-8")
	const plainText = content
		.split("\n") // Split the content by new lines
		.filter(
			line =>
				!line.startsWith("WEBVTT") &&
				!line.startsWith("Kind:") &&
				!line.startsWith("Language:") &&
				!line.match(/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}/) &&
				!line.trim().startsWith("NOTE") &&
				line.trim() !== ""
		)
		.map(
			line =>
				line
					.replace(/<c[.\w\d]+>/g, "")
					.replace(/<\/c>/g, "")
					.replace(/<\d{2}:\d{2}:\d{2}.\d{3}>/g, "")
					.replace(/<c>/g, "") // Remove <c> tags
					.replace(/<\/c>/g, "") // Remove </c> tags
		)
		.reduce(
			(acc, line): any =>
				acc.length && acc[acc.length - 1] === line ? acc : [...acc, line],
			[]
		)
		.join(" ")

	return plainText
}

export function convertTrTextToSlug(text: string): string {
	const turkishToEnglish: { [key: string]: string } = {
		ş: "s",
		ç: "c",
		ğ: "g",
		ı: "i",
		ö: "o",
		ü: "u",
	}

	return text
		.trim()
		.toLowerCase()
		.replace(/[şçğüöı]/g, match => turkishToEnglish[match] || match)
		.replace(/[^\w\s-]/g, "")
		.replace(
			/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}\u{1F0CF}\u{1F18E}\u{3299}\u{3297}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FB}\u{25FC}\u{2B1B}\u{2B1C}\u{25B6}\u{25C0}\u{1F200}-\u{1F251}]+/gu,
			""
		)
		.replace(/\s+/g, "-")
}

/**
 * Copies text to the clipboard.
 * @param text The text to be copied to the clipboard.
 */
export function copyToClipboard(text: string): void {
	execSync(`echo "${text.replace(/"/g, '\\"')}" | pbcopy`)
}

/**
 * Returns the text from the clipboard.
 * @returns The text from the clipboard.
 */
export function pasteFromClipboard(): string {
	return execSync("pbpaste").toString()
}

export function findUpdatedPart(oldStr: string, newStr: string) {
	let updatedPart = ""

	for (let i = 0; i < Math.min(oldStr.length, newStr.length); i++) {
		if (oldStr[i] !== newStr[i]) {
			updatedPart += newStr[i]
		}
	}

	return updatedPart + newStr.slice(oldStr.length)
}
