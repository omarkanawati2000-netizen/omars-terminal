import PyPDF2
import os

pdf_path = os.path.expanduser('~/Downloads/Guide to the Bloomberg Terminal.pdf')
pdf = open(pdf_path, 'rb')
reader = PyPDF2.PdfReader(pdf)

# Save to file instead of printing
output_file = 'bloomberg_guide_extracted.txt'

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(f'Total Pages: {len(reader.pages)}\n\n')
    f.write('='*80 + '\n')
    
    # Extract all pages
    for i in range(len(reader.pages)):
        text = reader.pages[i].extract_text()
        f.write(f'\n--- PAGE {i+1} ---\n\n')
        f.write(text)
        f.write('\n\n' + '='*80 + '\n')

pdf.close()

print(f'Extracted {len(reader.pages)} pages to {output_file}')
