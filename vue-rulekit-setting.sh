# Set path to vue-rulekit (adjust this path to where you cloned vue-rulekit)
RULEKIT_PATH="/Users/user/Documents/github/vue-rulekit"

# Create .cursor directory structure
mkdir -p .cursor/rules

# Copy main project rules
cat > .cursor/rules/global.mdc << EOF
---
description: Vue.js project rules and standards
alwaysApply: true
---
$(cat "$RULEKIT_PATH/PROJECT/CLAUDE.md")
EOF

# Auto-discover and copy all domain-specific CLAUDE.md files
find "$RULEKIT_PATH/PROJECT/src" -name "CLAUDE.md" | while read -r file; do
  # Extract directory name (components, composables, pages, etc.)
  dir_name=$(basename "$(dirname "$file")")

  # Create appropriate .mdc file with frontmatter
  cat > ".cursor/rules/vue-${dir_name}.mdc" << EOF
---
description: Vue.js ${dir_name} patterns and best practices
globs: ["**/${dir_name}/**/*"]
alwaysApply: false
---
$(cat "$file")
EOF
done