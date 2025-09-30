#!/usr/bin/env bash
set -euo pipefail

if ! command -v fzf &> /dev/null; then
  brew install fzf
fi

PKG="${1:-express}"

# Fetch full metadata once
json="$(curl -s "https://registry.npmjs.org/${PKG}")"

# Build sorted version list
VERSIONS="$(jq -r '.versions | keys[]' <<<"$json" | sort -V)"

# Get all unique authors (handle string or object with .name)
AUTHORS="$(
jq -r '
  [.versions[].author?]
  | map(
      if type=="string" then {name: ., email: null}
      elif type=="object" then {name: (.name // ""), email: (.email // null)}
      else empty end
    )
  | map(select(.name != ""))
  | unique_by(.name)
  # pretty print
  | sort_by(.name)
  | .[]
  | "\(.name) \(.email // "")"
' <<<"$json"
)"

CONTRIBUTORS="$(
jq -r '
  [(.versions[].contributors? // [])[]]
  | map(
      if type=="string" then {name: ., email: null}
      elif type=="object" then {name: (.name // ""), email: (.email // null)}
      else empty end
    )
  | map(select(.name != ""))
  | unique_by(.name)
  # pretty print
  | sort_by(.name)
  | .[]
  | "\(.name) \(.email // "")"
' <<<"$json"
)"

# convert bugs.url string to replace github.com with api.github.com and replace repos with issues
BUGS_URL="$(jq -r '.bugs.url // empty' <<<"$json" | sed -E 's#https://github\.com/([^/]+)/([^/]+).*#https://api.github.com/repos/\1/\2/issues#')"


issues=$(curl -s "$BUGS_URL" | jq '.[] | "- " + .title + " (" + .html_url + ")"')
if [[ -n "$issues" ]]; then
  echo "Latest issues:"
  echo "$issues"
fi


echo "========================="


# Fill array (portable)
VERSIONS_ARRAY=()
while IFS= read -r v; do
  VERSIONS_ARRAY+=("$v")
done <<< "$VERSIONS"

# Get latest version safely
last_index=$(( ${#VERSIONS_ARRAY[@]} - 1 ))
LATEST_VERSION="${VERSIONS_ARRAY[$last_index]}"

echo "Package: $PKG"
echo "Latest version: $LATEST_VERSION"

echo "Authors:" 
echo "$AUTHORS"

echo "Contributors:" 
echo "$CONTRIBUTORS"

