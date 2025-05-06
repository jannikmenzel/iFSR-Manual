#!/bin/bash

# set input, output, and template file paths
SOURCE_DIR="./docs"
OUTPUT_DIR="./page"
TEMPLATE="./template.html"

# check if the template file exists
if [ ! -f "$TEMPLATE" ]; then
    echo "Template $TEMPLATE nicht gefunden!"
    exit 1
fi

# create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# loop over all Markdown files in the source directory
for md_file in "$SOURCE_DIR"/*.md; do
    base_name=$(basename "$md_file" .md)
    output_subdir="$OUTPUT_DIR/$base_name"
    mkdir -p "$output_subdir"
    output_file="$output_subdir/index.html"

    echo "convert $md_file -> $output_file"

    # convert Markdown to HTML using pandoc
    content=$(pandoc "${md_file}")

    # insert converted content into the HTML template
    printf '%s\n' "$content" | sed '/{{content}}/{
        s/{{content}}//g
        r /dev/stdin
    }' "$TEMPLATE" > "$output_file"

done

# also convert einleitung.md to index.html in root output
INTRO_MD="$SOURCE_DIR/einleitung.md"
INTRO_HTML="./index.html"

if [ -f "$INTRO_MD" ]; then
    echo "convert $INTRO_MD -> $INTRO_HTML"
    intro_content=$(pandoc "${INTRO_MD}")
    printf '%s\n' "$intro_content" | sed '/{{content}}/{
        s/{{content}}//g
        r /dev/stdin
    }' "$TEMPLATE" > "$INTRO_HTML"
else
    echo "$INTRO_MD nicht gefunden!"
fi

