#!/bin/bash

# set input, output, and template file paths
SOURCE_DIR="./docs"
OUTPUT_DIR="./page"
TEMPLATE="./index.html"

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

# adjust relative paths in generated HTML files
for html_file in "$OUTPUT_DIR"/*/*.html; do
    sed -i '' 's|css/|../../css/|g' "$html_file"
    sed -i '' 's|\/assets/|../../assets/|g' "$html_file"
    sed -i '' 's|assets/favicon.svg|../../assets/favicon.svg|g' "$html_file"
    sed -i '' 's|js/|../../js/|g' "$html_file"
done