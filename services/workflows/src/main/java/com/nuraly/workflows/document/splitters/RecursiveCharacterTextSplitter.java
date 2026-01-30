package com.nuraly.workflows.document.splitters;

import com.nuraly.workflows.document.TextSplitter;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;

/**
 * Recursive character text splitter that tries to split on natural boundaries.
 * Attempts to split on paragraphs, then sentences, then words, then characters.
 * Similar to LangChain's RecursiveCharacterTextSplitter.
 */
@ApplicationScoped
public class RecursiveCharacterTextSplitter implements TextSplitter {

    // Separators in order of preference (try paragraphs first, then sentences, etc.)
    private static final String[] DEFAULT_SEPARATORS = {
            "\n\n",     // Paragraph
            "\n",       // Line break
            ". ",       // Sentence
            "? ",       // Question
            "! ",       // Exclamation
            "; ",       // Semicolon
            ", ",       // Comma
            " ",        // Word
            ""          // Character
    };

    @Override
    public List<TextChunk> split(String text, int chunkSize, int chunkOverlap) {
        if (text == null || text.isEmpty()) {
            return new ArrayList<>();
        }

        List<TextChunk> chunks = new ArrayList<>();
        List<String> splits = splitText(text, chunkSize, DEFAULT_SEPARATORS, 0);

        int offset = 0;
        int index = 0;

        for (String split : splits) {
            // Find actual position in original text
            int startOffset = text.indexOf(split, offset);
            if (startOffset == -1) startOffset = offset;

            TextChunk chunk = new TextChunk(split, index, startOffset, startOffset + split.length());
            chunks.add(chunk);

            offset = startOffset + split.length() - chunkOverlap;
            if (offset < 0) offset = 0;
            index++;
        }

        return chunks;
    }

    private List<String> splitText(String text, int chunkSize, String[] separators, int separatorIndex) {
        List<String> finalChunks = new ArrayList<>();

        if (text.length() <= chunkSize) {
            if (!text.trim().isEmpty()) {
                finalChunks.add(text);
            }
            return finalChunks;
        }

        // Find the appropriate separator
        String separator = "";
        int nextSeparatorIndex = separatorIndex;

        for (int i = separatorIndex; i < separators.length; i++) {
            if (separators[i].isEmpty() || text.contains(separators[i])) {
                separator = separators[i];
                nextSeparatorIndex = i + 1;
                break;
            }
        }

        // Split on the separator
        String[] splits;
        if (separator.isEmpty()) {
            // Character-level split
            splits = new String[text.length()];
            for (int i = 0; i < text.length(); i++) {
                splits[i] = String.valueOf(text.charAt(i));
            }
        } else {
            splits = text.split(java.util.regex.Pattern.quote(separator), -1);
        }

        // Merge splits into chunks
        StringBuilder currentChunk = new StringBuilder();
        List<String> goodSplits = new ArrayList<>();

        for (String split : splits) {
            String piece = separator.isEmpty() ? split : split + separator;

            if (piece.length() > chunkSize) {
                // Piece is too big, need to split further
                if (currentChunk.length() > 0) {
                    finalChunks.add(currentChunk.toString().trim());
                    currentChunk = new StringBuilder();
                }
                // Recursively split the large piece
                if (nextSeparatorIndex < separators.length) {
                    finalChunks.addAll(splitText(piece, chunkSize, separators, nextSeparatorIndex));
                } else {
                    // Can't split further, just add it
                    finalChunks.add(piece.trim());
                }
            } else if (currentChunk.length() + piece.length() > chunkSize) {
                // Adding this piece would exceed chunk size
                if (currentChunk.length() > 0) {
                    finalChunks.add(currentChunk.toString().trim());
                }
                currentChunk = new StringBuilder(piece);
            } else {
                currentChunk.append(piece);
            }
        }

        // Add remaining chunk
        if (currentChunk.length() > 0) {
            String remaining = currentChunk.toString().trim();
            if (!remaining.isEmpty()) {
                finalChunks.add(remaining);
            }
        }

        return finalChunks;
    }
}
