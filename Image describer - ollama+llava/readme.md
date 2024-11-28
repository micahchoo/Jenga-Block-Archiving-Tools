# Local Image Description Generator

This tool helps small archives and collections generate textual descriptions for their image collections using local AI models. It's designed to process large collections of images systematically while maintaining careful tracking of progress and providing robust error handling.

This tool addresses these challenges by:
- Running entirely locally using open source models
- Maintaining careful progress tracking to handle large collections
- Generating CSV files that can be easily imported into collection management systems
- Supporting interrupted and resumed processing
- Keeping detailed logs for accountability

## Prerequisites

### Windows
1. Install Python 3.8 or higher from [python.org](https://python.org)
2. Install Git from [git-scm.com](https://git-scm.com)
3. Install Ollama from [ollama.ai](https://ollama.ai)
4. Download the LLaVA model by running: `ollama pull llava`

### macOS
1. Install Homebrew from [brew.sh](https://brew.sh)
2. Install Python and Git:
   ```bash
   brew install python git
   ```
3. Install Ollama:
   ```bash
   brew install ollama
   ```
4. Download the LLaVA model:
   ```bash
   ollama pull llava
   ```

### Linux (Ubuntu/Debian)
1. Install Python and Git:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv git
   ```
2. Install Ollama following instructions at [ollama.ai](https://ollama.ai)
3. Download the LLaVA model:
   ```bash
   ollama pull llava
   ```

## Installation

1. Clone this repository:

2. Run the launcher script:
   - On macOS/Linux: 
     ```bash
     chmod +x process_images.sh
     ./process_images.sh
     ```
    - On Win
        run process_images.bat


The launcher will automatically:
- Create a Python virtual environment
- Install required packages
- Launch the processing script

Also read the comments on the code itself

## Usage

1. Start Ollama and ensure the LLaVA model is running:
   ```bash
   ollama run llava
   ```

2. In a new terminal, run the launcher script as described above

3. Enter the path to your image folder when prompted

The tool will:
- Process all images in the specified folder and subfolders
- Create a `descriptions.csv` file in each folder containing images
- Maintain a central registry of all CSV files created
- Save progress regularly to allow interrupted processing to be resumed
- Generate detailed logs in the `logs` directory

## Generated Files

The tool creates several types of files:

- `descriptions.csv`: Created in each folder containing images, with columns for:
  - Filename
  - Description
  - Timestamp

- `logs/image_processing_YYYYMMDD_HHMMSS.log`: Detailed processing logs

- `processing_history/progress_HASH_YYYYMMDD.json`: Progress tracking files

- `processing_history/csv_locations.csv`: Central registry of all generated CSV files



## Acknowledgments

- [Ollama](https://ollama.ai) for local AI model running
- [LLaVA](https://llava-vl.github.io) for image understanding
- Various Python packages listed in requirements.txt
- Anthropic Claude for the code - made while continuously testing on a small archive 