#!/bin/bash

# Security test runner for model-eval API
# This script runs the security tests against the model-eval API

# Detect script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Default values
DEFAULT_URL="https://model-eval-aa67ebbb791b.herokuapp.com"
GENERATE_HTML=false
VERBOSE=false
CUSTOM_URL=""

# Display help
function show_help {
  echo "API Security Test Runner"
  echo "------------------------"
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help       Show this help message"
  echo "  -v, --verbose    Show detailed output for requests/responses"
  echo "  --html           Generate HTML report"
  echo "  -u, --url URL    Test against a custom URL"
  echo ""
  echo "Examples:"
  echo "  $0                       # Run basic test against default Heroku URL"
  echo "  $0 --html                # Generate HTML report"
  echo "  $0 -v -u http://localhost:8001  # Test local server with verbose output"
  echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    --html)
      GENERATE_HTML=true
      shift
      ;;
    -u|--url)
      CUSTOM_URL="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Build command
CMD="node $SCRIPT_DIR/test-api-security.js"

# Add options
if [ "$VERBOSE" = true ]; then
  CMD="$CMD --verbose"
fi

if [ "$GENERATE_HTML" = true ]; then
  CMD="$CMD --html"
fi

if [ -n "$CUSTOM_URL" ]; then
  CMD="$CMD --url=$CUSTOM_URL"
else
  CMD="$CMD --url=$DEFAULT_URL"
fi

# Print header
echo "========================================================"
echo "🔒 Model Eval API Security Test"
echo "========================================================"
echo "Running security tests against: ${CUSTOM_URL:-$DEFAULT_URL}"
echo "Verbose mode: $VERBOSE"
echo "HTML report: $GENERATE_HTML"
echo "========================================================" 
echo ""

# Execute tests
$CMD

# Check exit status
STATUS=$?
if [ $STATUS -ne 0 ]; then
  echo ""
  echo "❌ Security tests failed with exit code $STATUS"
  exit $STATUS
fi

# If we're here, the tests completed (though they may have found issues)
echo ""
echo "✅ Security test execution completed"
echo "For more information, see the README.md in this directory"
echo ""

# If HTML report was generated, try to open it
if [ "$GENERATE_HTML" = true ]; then
  REPORT_PATH="$(pwd)/security-report.html"
  if [ -f "$REPORT_PATH" ]; then
    echo "📊 HTML Report generated at: $REPORT_PATH"
    
    # Try to open the report based on the platform
    case "$(uname -s)" in
      Darwin*)  # macOS
        open "$REPORT_PATH" 2>/dev/null || echo "To view the report, open $REPORT_PATH in your browser"
        ;;
      Linux*)   # Linux
        xdg-open "$REPORT_PATH" 2>/dev/null || echo "To view the report, open $REPORT_PATH in your browser"
        ;;
      MINGW*|CYGWIN*)  # Windows
        start "$REPORT_PATH" 2>/dev/null || echo "To view the report, open $REPORT_PATH in your browser"
        ;;
      *)
        echo "To view the report, open $REPORT_PATH in your browser"
        ;;
    esac
  else
    echo "⚠️ HTML Report was not generated successfully"
  fi
fi