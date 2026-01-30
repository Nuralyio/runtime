package com.nuraly.workflows.document.splitters;

import com.nuraly.workflows.document.TextSplitter;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Text splitter that splits on sentence boundaries and groups sentences
 * into chunks of the target size.
 */
@ApplicationScoped
public class SentenceTextSplitter implements TextSplitter {

    // Pattern to match sentence endings
    private static final Pattern SENTENCE_PATTERN = Pattern.compile(
            "(?<=[.!?])\\s+(?=[A-Z])|(?<=[.!?])\\s*$",
            Pattern.MULTILINE
    );

    @Override
    public List<TextChunk> split(String text, int chunkSize, int chunkOverlap) {
        if (text == null || text.isEmpty()) {
            return new ArrayList<>();
        }

        // Split into sentences
        List<String> sentences = splitIntoSentences(text);

        // Group sentences into chunks
        List<TextChunk> chunks = new ArrayList<>();
        StringBuilder currentChunk = new StringBuilder();
        List<String> currentSentences = new ArrayList<>();
        int chunkIndex = 0;
        int textOffset = 0;

        for (String sentence : sentences) {
            if (currentChunk.length() + sentence.length() > chunkSize && currentChunk.length() > 0) {
                // Save current chunk
                String chunkText = currentChunk.toString().trim();
                int startOffset = text.indexOf(chunkText, textOffset);
                if (startOffset == -1) startOffset = textOffset;

                chunks.add(new TextChunk(chunkText, chunkIndex++, startOffset, startOffset + chunkText.length()));

                // Handle overlap - keep some sentences for the next chunk
                currentChunk = new StringBuilder();
                int overlapChars = 0;
                List<String> overlapSentences = new ArrayList<>();

                for (int i = currentSentences.size() - 1; i >= 0 && overlapChars < chunkOverlap; i--) {
                    String s = currentSentences.get(i);
                    overlapChars += s.length();
                    overlapSentences.add(0, s);
                }

                for (String s : overlapSentences) {
                    currentChunk.append(s);
                }
                currentSentences = new ArrayList<>(overlapSentences);

                textOffset = startOffset + chunkText.length() - overlapChars;
                if (textOffset < 0) textOffset = 0;
            }

            currentChunk.append(sentence);
            currentSentences.add(sentence);
        }

        // Add final chunk
        if (currentChunk.length() > 0) {
            String chunkText = currentChunk.toString().trim();
            if (!chunkText.isEmpty()) {
                int startOffset = text.indexOf(chunkText, textOffset);
                if (startOffset == -1) startOffset = textOffset;
                chunks.add(new TextChunk(chunkText, chunkIndex, startOffset, startOffset + chunkText.length()));
            }
        }

        return chunks;
    }

    private List<String> splitIntoSentences(String text) {
        List<String> sentences = new ArrayList<>();

        // Simple sentence splitting
        Matcher matcher = SENTENCE_PATTERN.matcher(text);
        int lastEnd = 0;

        while (matcher.find()) {
            String sentence = text.substring(lastEnd, matcher.start() + 1).trim();
            if (!sentence.isEmpty()) {
                sentences.add(sentence + " ");
            }
            lastEnd = matcher.end();
        }

        // Add remaining text
        if (lastEnd < text.length()) {
            String remaining = text.substring(lastEnd).trim();
            if (!remaining.isEmpty()) {
                sentences.add(remaining);
            }
        }

        // If no sentences found, return the whole text
        if (sentences.isEmpty() && !text.trim().isEmpty()) {
            sentences.add(text.trim());
        }

        return sentences;
    }
}
