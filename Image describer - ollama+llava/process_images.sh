#!/bin/bash

# Store the script's directory path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Text styling for better readability
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if virtual environment exists
check_venv() {
    if [ ! -d "$SCRIPT_DIR/venv" ]; then
        echo -e "${BLUE}Creating virtual environment...${NC}"
        python3 -m venv "$SCRIPT_DIR/venv"
        
        echo -e "${BLUE}Installing required packages...${NC}"
        source "$SCRIPT_DIR/venv/bin/activate"
        pip install tqdm pathlib requests
    fi
}

# Function to display the header
show_header() {
    clear
    echo -e "${BOLD}================================${NC}"
    echo -e "${BOLD}   Image Processing Launcher     ${NC}"
    echo -e "${BOLD}================================${NC}"
    echo
}

# Main execution
show_header

# Check and setup virtual environment
check_venv

# Activate virtual environment
source "$SCRIPT_DIR/venv/bin/activate"

# Display virtual environment information
echo -e "Virtual Environment: ${BOLD}$SCRIPT_DIR/venv${NC}"
echo

# Get the image folder path from user
echo -e "${BOLD}Please enter the path to your image folder:${NC}"
echo "Example: /media/username/drive/images"
echo -e "${BLUE}(Press Enter to use current directory)${NC}"
echo
read -r IMAGE_PATH

# If no path is provided, use current directory
if [ -z "$IMAGE_PATH" ]; then
    IMAGE_PATH="$(pwd)"
fi

# Expand any ~ in the path
IMAGE_PATH="${IMAGE_PATH/#\~/$HOME}"

# Validate the path
if [ ! -d "$IMAGE_PATH" ]; then
    echo -e "\n${BOLD}Error: Directory does not exist!${NC}"
    echo "Please check the path and try again."
    exit 1
fi

# Show confirmation and launch Python script with the path as an argument
echo -e "${BLUE}Launching image processor...${NC}"
# Modified to pass the path directly to the Python script
python3 "$SCRIPT_DIR/process_images.py" "$IMAGE_PATH"

# Keep terminal open if there are errors
echo
echo -e "${BOLD}Press any key to exit.${NC}"
read -n 1 -s -r

# Deactivate virtual environment
deactivate