import { splitTextIntoParagraphs } from "../text" // Assume your function is in textUtils.ts

describe("splitTextIntoParagraphs", () => {
	it("should split text into paragraphs without exceeding the maximum character length", () => {
		const text =
			"This is a test. This should be split into multiple paragraphs based on the length provided. Each paragraph should respect the maximum character limit."
		const maxChars = 50
		const expected = [
			"This is a test. This should be split into",
			"multiple paragraphs based on the length provided.",
			"Each paragraph should respect the maximum",
			"character limit.",
		]
		const result = splitTextIntoParagraphs(text, maxChars)
		expect(result).toEqual(expected)
	})

	it("should handle text shorter than maxChars without splitting", () => {
		const text = "Short text"
		const maxChars = 50
		const expected = [text]
		const result = splitTextIntoParagraphs(text, maxChars)
		expect(result).toEqual(expected)
	})

	it("should correctly split text with multiple new lines", () => {
		const text = "First paragraph\n\nSecond paragraph is here\nAnd continues here."
		const maxChars = 30
		const expected = [
			"First paragraph",
			"Second paragraph is here",
			"And continues here.",
		]
		const result = splitTextIntoParagraphs(text, maxChars)
		expect(result).toEqual(expected)
	})

	it("should not leave trailing spaces", () => {
		const text = "Text with trailing spaces should split well."
		const maxChars = 10
		const expected = ["Text with", "trailing", "spaces", "should", "split", "well."]
		const result = splitTextIntoParagraphs(text, maxChars)
		expected.forEach((part, idx) => {
			expect(part.endsWith(" ")).toBeFalsy()
			expect(result[idx]).toEqual(part)
		})
	})
})
