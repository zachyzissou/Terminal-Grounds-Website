#!/usr/bin/env bash
# Import images from an "output" folder into site/assets/images and regenerate gallery snippet + manifest
# Usage: ./scripts/import-output.sh [SOURCE_DIR]
# If SOURCE_DIR omitted, tries ./output then ~/Downloads/output

set -euo pipefail
IFS=$'\n\t'

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC=${1:-"$REPO_ROOT/output"}
if [ ! -d "$SRC" ]; then
  if [ -d "$HOME/Downloads/output" ]; then
    SRC="$HOME/Downloads/output"
  else
    echo "Source directory not found: $SRC"
    echo "Pass the path to your output folder as the first argument. Example:" 
    echo "  ./scripts/import-output.sh ~/Downloads/output"
    exit 1
  fi
fi

DEST="$REPO_ROOT/site/assets/images"
SNIPPET="$REPO_ROOT/site/assets/snippets/gallery-items.html"
MANIFEST="$DEST/manifest.json"

# Vision report CSV path
VISION_REPORT="$REPO_ROOT/output/vision-quality-report.csv"

# Create category directories (portable)
mkdir -p "$DEST"
mkdir -p "$DEST/renders"
mkdir -p "$DEST/environments"
mkdir -p "$DEST/factions"
mkdir -p "$DEST/vehicles"
mkdir -p "$DEST/weapons"
mkdir -p "$DEST/ui"
mkdir -p "$DEST/characters"
mkdir -p "$DEST/others"

# Helper: parse vision report and build AAA image list (portable)
# Writes a newline-separated list of relative image paths into $REPO_ROOT/.aaa_images.list
AAA_LIST_FILE="$REPO_ROOT/.aaa_images_strict.list"
if [ -f "$AAA_LIST_FILE" ]; then
  echo "Using strictly filtered high-quality image list: $AAA_LIST_FILE"
else
  # Fallback to original vision-based selection if strict list doesn't exist
  AAA_LIST_FILE="$REPO_ROOT/.aaa_images_filtered.list"
  if [ ! -f "$AAA_LIST_FILE" ]; then
    AAA_LIST_FILE="$REPO_ROOT/.aaa_images.list"
    : > "$AAA_LIST_FILE"
    if [ -f "$VISION_REPORT" ]; then
      # Select top 50 images by composite score:
      # score = 0.4 * (contrast / maxContrast) + 0.4 * (sharpness / maxSharpness) + 0.2 * (area / maxArea)
      # We only consider files whose path begins with site/assets/images/ to match the site's structure.
      TMP_SCORES_FILE=$(mktemp)
      awk -F',' '
        FNR==1 { next } # skip header
        { path=$1; gsub(/^"|"$/, "", path); contrast=$2+0; sharp=$3+0; w=$4+0; h=$5+0; area=w*h; 
          data[NR]=path "|" contrast "|" sharp "|" area;
          if (contrast>maxC) maxC=contrast;
          if (sharp>maxS) maxS=sharp;
          if (area>maxA) maxA=area;
        }
        END{
          for(i in data){
            split(data[i],a,"|");
            p=a[1]; c=a[2]+0; s=a[3]+0; ar=a[4]+0;
            if (p ~ /^site\/assets\/images\//) {
              nc = (maxC>0) ? (c/maxC) : 0;
              ns = (maxS>0) ? (s/maxS) : 0;
              na = (maxA>0) ? (ar/maxA) : 0;
              score = nc*0.4 + ns*0.4 + na*0.2;
              # Output: score,path
              printf("%.8f,%s\n", score, p);
            }
          }
        }' "$VISION_REPORT" > "$TMP_SCORES_FILE"

      # Sort the temporary scores file and take top 50, then strip prefix
      TMP_SORTED=$(mktemp)
      sort -t, -k1,1nr "$TMP_SCORES_FILE" > "$TMP_SORTED"
      head -n 50 "$TMP_SORTED" | cut -d, -f2- | sed 's|^site/assets/images/||' > "$AAA_LIST_FILE"
      rm -f "$TMP_SCORES_FILE" "$TMP_SORTED"
    fi
  fi
fi

# Helper: copy best match files for a list of patterns into a category directory
copy_matches() {
  local pattern="$1"; shift
  local outdir="$1"; shift

  # Find matching files (case-insensitive) and iterate safely
  find "$SRC" -type f -iname "*${pattern}*" -print0 2>/dev/null | \
    while IFS= read -r -d '' f; do
      base=$(basename "$f")
      destpath="$outdir/$base"
      # Prefer files with keywords indicating highest quality
      if echo "$base" | grep -Eq 'PERFECT|ENHANCED|FIXED|CLEAN|WIDE|1920|2560|2048|_High|_Hq|HQ_' ; then
        # If existing file is lower priority, replace
        if [ -f "$destpath" ]; then
          if ! echo "$(basename "$destpath")" | grep -Eq 'PERFECT|ENHANCED|FIXED|CLEAN|WIDE|1920|2560|2048|_High|_Hq|HQ_' ; then
            cp -f "$f" "$destpath" || true
          fi
        else
          cp -n "$f" "$destpath" || true
        fi
      else
        cp -n "$f" "$destpath" || true
      fi
    done
}

# Category rules (simple heuristics based on filename tokens)
copy_matches "PERFECT" "$DEST/renders" || true
copy_matches "hero" "$DEST/renders" || true
copy_matches "render" "$DEST/renders" || true

copy_matches "Metro" "$DEST/environments" || true
copy_matches "Maintenance" "$DEST/environments" || true
copy_matches "IEZ" "$DEST/environments" || true
copy_matches "Tech_Wastes" "$DEST/environments" || true
copy_matches "Underground" "$DEST/environments" || true
copy_matches "Bunker" "$DEST/environments" || true
copy_matches "Security_Checkpoint" "$DEST/environments" || true
copy_matches "Corporate_Lobby" "$DEST/environments" || true

copy_matches "Emblem" "$DEST/factions" || true
copy_matches "Territorial_Flag" "$DEST/factions" || true
copy_matches "Emblem_Var" "$DEST/factions" || true
copy_matches "FIXED_Emblem" "$DEST/factions" || true
copy_matches "Enhanced_Emblem" "$DEST/factions" || true

copy_matches "Vehicle" "$DEST/vehicles" || true
copy_matches "Vehicle_" "$DEST/vehicles" || true
copy_matches "Weapon" "$DEST/weapons" || true
copy_matches "Weapon_" "$DEST/weapons" || true
copy_matches "UI_" "$DEST/ui" || true
copy_matches "HUD" "$DEST/ui" || true
copy_matches "Character" "$DEST/characters" || true

# Anything leftover put into others (only top-level files in SRC)
find "$SRC" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0 | while IFS= read -r -d '' f; do
  base=$(basename "$f")
  if [ -f "$DEST/renders/$base" ] || [ -f "$DEST/environments/$base" ] || [ -f "$DEST/factions/$base" ] || [ -f "$DEST/vehicles/$base" ] || [ -f "$DEST/weapons/$base" ] || [ -f "$DEST/ui/$base" ] || [ -f "$DEST/characters/$base" ]; then
    continue
  fi
  cp -n "$f" "$DEST/others/" || true
done || true

# Generate gallery-items.html from images we copied
echo "<!-- Auto-generated by scripts/import-output.sh on $(date -u +'%Y-%m-%dT%H:%M:%SZ') -->" > "$SNIPPET"

# Helper to capitalize category for caption
cap_first() {
  local s="$1"
  printf "%s" "$(printf '%s' "$s" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
}

generate_entries_for_dir() {
  local dir="$1"
  local category="$2"
  for img in "$dir"/*; do
    [ -f "$img" ] || continue
    # Only process image files (case-insensitive)
    ext=$(echo "${img##*.}" | tr '[:upper:]' '[:lower:]')
    case "$ext" in
      png|jpg|jpeg) : ;;
      *) continue ;;
    esac
    fname=$(basename "$img")
    relpath_from_site="${category}/$fname"
    
    # Only include images that are in the filtered AAA list
    if [ -s "$AAA_LIST_FILE" ] && grep -Fxq "$relpath_from_site" "$AAA_LIST_FILE" 2>/dev/null; then
      alt=$(echo "$fname" | sed -E 's/[_\-]+/ /g' | sed -E 's/\.(png|jpg|jpeg)$//I')
      style="default"
      if echo "$fname" | grep -Ei 'clean' >/dev/null; then style="clean"; fi
      if echo "$fname" | grep -Ei 'gritty' >/dev/null; then style="gritty"; fi
      if echo "$fname" | grep -Ei 'hero' >/dev/null; then style="hero"; fi

      relpath="/assets/images/${category}/$fname"
      caption="$(cap_first "$category") asset"

      # Tag AAA quality (all images in filtered list are AAA)
      aaa_tag='<span class="quality-tag aaa">AAA Quality</span>'

      cat >> "$SNIPPET" <<EOF
<div class="asset-item" data-category="$category" data-style="$style">
  <img src="$relpath" alt="$alt" class="asset-image" loading="lazy">
  <div class="asset-overlay">
    <h4>$alt</h4>
    <p>$caption</p>
    $aaa_tag
    <span class="rarity-tag common">Common</span>
  </div>
</div>
EOF
    fi
  done
}

generate_entries_for_dir "$DEST/renders" "renders"
generate_entries_for_dir "$DEST/environments" "environments"
generate_entries_for_dir "$DEST/vehicles" "vehicles"
generate_entries_for_dir "$DEST/weapons" "weapons"
generate_entries_for_dir "$DEST/factions" "factions"
generate_entries_for_dir "$DEST/ui" "ui"
generate_entries_for_dir "$DEST/characters" "characters"
generate_entries_for_dir "$DEST/others" "renders"

# Generate entries for root-level images in the filtered list
if [ -s "$AAA_LIST_FILE" ]; then
  while IFS= read -r img_path; do
    # Only process images that don't have a subdirectory (root level)
    if [[ "$img_path" != */* ]]; then
      img_file="$DEST/$img_path"
      if [ -f "$img_file" ]; then
        fname=$(basename "$img_path")
        alt=$(echo "$fname" | sed -E 's/[_\-]+/ /g' | sed -E 's/\.(png|jpg|jpeg)$//I')
        style="default"
        if echo "$fname" | grep -Ei 'clean' >/dev/null; then style="clean"; fi
        if echo "$fname" | grep -Ei 'gritty' >/dev/null; then style="gritty"; fi
        if echo "$fname" | grep -Ei 'hero' >/dev/null; then style="hero"; fi

        relpath="/assets/images/$img_path"
        caption="Asset"

        # Tag AAA quality (all images in filtered list are AAA)
        aaa_tag='<span class="quality-tag aaa">AAA Quality</span>'

        cat >> "$SNIPPET" <<EOF
<div class="asset-item" data-category="others" data-style="$style">
  <img src="$relpath" alt="$alt" class="asset-image" loading="lazy">
  <div class="asset-overlay">
    <h4>$alt</h4>
    <p>$caption</p>
    $aaa_tag
    <span class="rarity-tag common">Common</span>
  </div>
</div>
EOF
      fi
    fi
  done < "$AAA_LIST_FILE"
fi

# Create manifest.json with some simple stats

# Write manifest.json with AAA image list
if command -v jq >/dev/null 2>&1; then
  renders_count=$(find "$DEST/renders" -type f | wc -l)
  env_count=$(find "$DEST/environments" -type f | wc -l)
  factions_count=$(find "$DEST/factions" -type f | wc -l)
  vehicles_count=$(find "$DEST/vehicles" -type f | wc -l)
  weapons_count=$(find "$DEST/weapons" -type f | wc -l)

  # Build AAA image array from file (portable)
  if [ -s "$AAA_LIST_FILE" ]; then
    aaa_json="["
    while IFS= read -r line; do
      # escape any double quotes in filename
      esc=$(printf '%s' "$line" | sed 's/\"/\\\"/g')
      aaa_json+="\"$esc\"," 
    done < "$AAA_LIST_FILE"
    aaa_json="${aaa_json%,}]"
  else
    aaa_json="[]"
  fi

  jq -n \
    --arg src "$SRC" \
    --argjson counts "{renders: $renders_count, environments: $env_count, factions: $factions_count, vehicles: $vehicles_count, weapons: $weapons_count}" \
    --argjson aaa "$aaa_json" \
    '{source: $src, total: ([$counts.renders,$counts.environments,$counts.factions,$counts.vehicles,$counts.weapons] | add), lastUpdated: (now | todate), categories: $counts, aaaImages: $aaa}' > "$MANIFEST"
else
  # Fallback: just write basic manifest
  cat > "$MANIFEST" <<JSON
{
  "source": "$SRC",
  "total": $(find "$DEST" -type f | wc -l),
  "lastUpdated": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
}
JSON
fi

# Summary
echo "Import complete. Images copied from: $SRC"
echo "Gallery snippet written to: $SNIPPET"
echo "Manifest written to: $MANIFEST"
echo "Counts:"
echo "  renders: $(ls -1 "$DEST/renders" 2>/dev/null | wc -l)"
echo "  environments: $(ls -1 "$DEST/environments" 2>/dev/null | wc -l)"
echo "  factions: $(ls -1 "$DEST/factions" 2>/dev/null | wc -l)"
echo "  vehicles: $(ls -1 "$DEST/vehicles" 2>/dev/null | wc -l)"
echo "  weapons: $(ls -1 "$DEST/weapons" 2>/dev/null | wc -l)"

cat <<EOF

Next steps:
1) Review the generated snippet: $SNIPPET
2) Start local server: cd site && python3 -m http.server 8000
   then open: http://localhost:8000/

If you want the script to run automatically and overwrite existing images, re-run with:
  ./scripts/import-output.sh /path/to/your/output

EOF
