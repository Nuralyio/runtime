#!/bin/bash

# Script to replace a string in a file

# Check if the correct number of arguments is given
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <file> <old_string> <new_string>"
    exit 1
fi

# Assign arguments to variables
FILE=$1
OLD_STRING=$2
NEW_STRING=$3

# Check if the file exists
if [ ! -f "$FILE" ]; then
    echo "Error: File does not exist."
    exit 1
fi

# Detect the Operating System
OS=$(uname)

# Use sed to replace the string
if [ "$OS" = "Darwin" ]; then
    # macOS requires an empty string for in-place editing without backup
    sed -i '' "s/$OLD_STRING/$NEW_STRING/g" "$FILE"
else
    # Linux
    sed -i "s/$OLD_STRING/$NEW_STRING/g" "$FILE"
fi

echo "String replacement completed."
