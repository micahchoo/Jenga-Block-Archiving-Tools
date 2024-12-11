# Import required libraries
# GMFT (Generic Magic Format Tables) is a library for detecting and extracting tables
from gmft.auto import CroppedTable, AutoTableDetector, AutoTableFormatter
from gmft.pdf_bindings import PyPDFium2Document
import os  # For working with files and directories
import pandas as pd  # For handling table data
from pathlib import Path  # For easier file path handling

def extract_tables_from_pdf(pdf_path, output_dir):
    """
    Extract tables from a PDF file and save them as CSV files.
    
    Args:
        pdf_path (str): Path to the PDF file (e.g., "folder/document.pdf")
        output_dir (str): Directory where CSV files will be saved (e.g., "output_folder")
    """
    # Create the output directory if it doesn't exist
    # parents=True means it will create parent directories if needed
    # exist_ok=True means it won't raise an error if directory already exists
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Initialize the tools we need for table detection and formatting
    detector = AutoTableDetector()    # Tool that finds tables in the PDF
    formatter = AutoTableFormatter()  # Tool that formats the found tables nicely
    
    # Open the PDF document
    doc = PyPDFium2Document(pdf_path)
    
    # List to store information about all tables we find
    tables = []
    
    try:
        # Loop through each page in the PDF
        # enumerate gives us both the page number (page_num) and the page content (page)
        for page_num, page in enumerate(doc):
            # Find all tables on the current page
            page_tables = detector.extract(page)
            
            # Process each table found on the page
            for table_num, table in enumerate(page_tables):
                try:
                    # Convert the table into a clean, formatted version
                    formatted_table = formatter.format(table)
                    # Convert the formatted table into a pandas DataFrame (a spreadsheet-like structure)
                    df = formatted_table.df()
                    
                    # Create a filename for the CSV
                    # Example: if input is "report.pdf", page 1, table 2
                    # Output will be "report_page1_table2.csv"
                    base_name = Path(pdf_path).stem  # Get filename without extension
                    csv_filename = f"{base_name}_page{page_num + 1}_table{table_num + 1}.csv"
                    csv_path = os.path.join(output_dir, csv_filename)
                    
                    # Save the table as a CSV file
                    df.to_csv(csv_path, index=False)
                    print(f"Saved table {table_num + 1} from page {page_num + 1} to {csv_filename}")
                    
                    # Store information about this table
                    tables.append({
                        'page': page_num + 1,
                        'table_num': table_num + 1,
                        'data': df,
                        'path': csv_path,
                        'filename': csv_filename
                    })
                except Exception as e:
                    # If something goes wrong with a specific table, print the error but continue processing
                    print(f"Error processing table {table_num + 1} on page {page_num + 1}: {str(e)}")
    finally:
        # Always close the PDF when we're done, even if there was an error
        doc.close()
    
    return tables

def main():
    # Set up the input and output directories
    pdf_dir = "pdfs"      # Folder containing PDF files to process
    output_dir = "outputs"  # Folder where CSV files will be saved
    
    # Process each PDF file in the pdf_dir
    # Path(pdf_dir).glob("*.pdf") finds all files ending in .pdf
    for pdf_file in Path(pdf_dir).glob("*.pdf"):
        print(f"\nProcessing {pdf_file.name}...")
        tables = extract_tables_from_pdf(str(pdf_file), output_dir)
        
        # Print summary of how many tables were found
        if tables:
            print(f"\nProcessed {len(tables)} tables...")
        else:
            print("No tables found in the PDF.")

# This is the standard Python way to make sure the script only runs
# when executed directly (not when imported as a module)
if __name__ == "__main__":
    main()
