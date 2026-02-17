import * as mammoth from 'mammoth';


const { PDFParse } = require('pdf-parse');


export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
  
    return result.text.trim();
  } catch (error) {

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
}


export async function extractTextFromDOCX(fileBuffer: Buffer): Promise<string> {
  try {
    
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    
    
    return result.value.trim();
  } catch (error) {
   
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from DOCX: ${errorMessage}`);
  }
}
