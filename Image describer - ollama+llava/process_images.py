import os
import csv
from datetime import datetime
import requests
import base64
import time
import json
from pathlib import Path
import logging
from tqdm import tqdm
import backoff
import signal
import sys

class ImageProcessor:
    """
    A robust image processing system designed for archival collections.
    
    This class handles the systematic processing of image collections, generating
    descriptions using local AI models while maintaining careful progress tracking
    and error handling. It's specifically designed for archivists and collection
    managers who need to process large numbers of images reliably.
    
    Key features:
    - Processes images in batches with progress tracking
    - Maintains CSV files of descriptions in each directory
    - Keeps a central registry of all generated CSV files
    - Provides detailed logging
    - Handles interruptions gracefully
    - Supports resuming interrupted processing
    """

    def __init__(self, root_folder):
        """
        Initialize the image processor with a root folder path.
        
        Args:
            root_folder (str): Path to the root folder containing images to process
        """
        # Core configuration
        self.root_folder = Path(root_folder)
        self.shutdown_flag = False  # Used for graceful shutdown
        self.image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp')
        
        # Set up the processing environment
        self.setup_directories()
        self.setup_logging()
        self.setup_signal_handling()
        
        # Initialize tracking systems
        self.processed_files = self.load_progress()
        self.initialize_csv_registry()

    def setup_directories(self):
        """
        Create necessary directories for logs and progress tracking.
        
        Creates:
            - logs/: Directory for detailed processing logs
            - processing_history/: Directory for progress tracking files
        """
        self.logs_dir = Path('logs')
        self.logs_dir.mkdir(exist_ok=True)
        
        self.progress_dir = Path('processing_history')
        self.progress_dir.mkdir(exist_ok=True)
        
        self.csv_registry_path = self.progress_dir / 'csv_locations.csv'

    def setup_logging(self):
        """
        Configure the logging system with both file and console output.
        
        Creates a new log file for each processing session with timestamp
        in the filename. Logs include timestamps, log levels, and messages.
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_file = self.logs_dir / f'image_processing_{timestamp}.log'
        
        log_format = '%(asctime)s - %(levelname)s - %(message)s'
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        logging.info(f"Starting new processing session")
        logging.info(f"Log file created at: {log_file}")

    def setup_signal_handling(self):
        """
        Set up graceful shutdown handling for Ctrl+C interruptions.
        
        Implements a two-stage shutdown:
        1. First Ctrl+C: Initiates graceful shutdown after current image
        2. Second Ctrl+C: Forces immediate shutdown
        """
        def signal_handler(signum, frame):
            if self.shutdown_flag:  # Second Ctrl+C
                print("\n\nForce quitting...")
                sys.exit(1)
            else:  # First Ctrl+C
                print("\n\nGracefully shutting down... Press Ctrl+C again to force quit.")
                self.shutdown_flag = True
        
        signal.signal(signal.SIGINT, signal_handler)
        return signal_handler

    [... continue with the rest of the class methods, each extensively documented ...]

def get_folder_path():
    """
    Interactively get and validate the input folder path.
    
    Prompts the user for a folder path, expands user paths (~/),
    and validates the path exists. Continues prompting until a
    valid path is provided or the user interrupts.
    
    Returns:
        str: Validated absolute path to the image folder
    """
    print("\nPlease enter the path to your image folder:")
    print("Example: /media/username/drive/images")
    print("(Press Enter to use current directory)")
    
    while True:
        try:
            path = input().strip() or os.getcwd()
            path = os.path.expanduser(path)  # Expand ~ if present
            path = os.path.abspath(path)     # Convert to absolute path
            
            if os.path.exists(path):
                return path
            else:
                print(f"Error: Path '{path}' does not exist.")
                print("Please enter a valid path:")
        except KeyboardInterrupt:
            raise
        except Exception as e:
            print(f"Error: {str(e)}")
            print("Please enter a valid path:")

def main():
    """
    Main entry point for the image processing script.
    
    Handles command-line arguments, initializes the processor,
    runs the processing, and provides feedback on completion.
    Also manages graceful shutdown and error handling.
    """
    try:
        # Validate command line arguments
        if len(sys.argv) != 2:
            print("Error: Please provide the image folder path as an argument")
            sys.exit(1)
            
        folder_path = sys.argv[1]
        print("\nLaunching image processor...")
        
        # Initialize and run processor
        processor = ImageProcessor(folder_path)
        processed, errors = processor.process_folder()
        
        # Report results
        if processor.shutdown_flag:
            print("\nProcessing was interrupted.")
        else:
            print(f"\nProcessing complete!")
        
        print(f"Total images processed this session: {processed}")
        print(f"Total errors this session: {errors}")
        print(f"CSV registry location: {processor.csv_registry_path}")
        print("Check the log file for detailed information.")
        
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
    except Exception as e:
        logging.error(f"Fatal error in main program", exc_info=True)
        print(f"\nAn error occurred: {str(e)}")
    finally:
        try:
            input("\nProcessing complete. Press any key to exit.")
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    main()