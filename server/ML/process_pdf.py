import sys
import json
import fitz
from rake_nltk import Rake
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM


def run_pipeline(pdf_path):
    document = fitz.open(pdf_path)
    pdf_text = {}
    for page_number in range(document.page_count):
        page = document.load_page(page_number)
        text = page.get_text()
        pdf_text[page_number + 1] = text
    document.close()

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    page_chunks = {
        page: text_splitter.split_text(text) for page, text in pdf_text.items()
    }

    # Extract key phrases
    rake = Rake()
    chunk_phrases = {}
    for page, chunks in page_chunks.items():
        for chunk_number, chunk in enumerate(chunks, start=1):
            rake.extract_keywords_from_text(chunk)
            phrases = rake.get_ranked_phrases()
            chunk_phrases[(page, chunk_number)] = phrases

    # Load embedding model
    print("Loading embedding model...", flush=True)
    model = SentenceTransformer("avemio-digital/ModernBERT_base_triples_embedding")
    print("Embedding model loaded.", flush=True)

    # Compute embeddings
    phrase_embeddings = {}
    for (page, chunk_number), phrases in chunk_phrases.items():
        embeddings = [model.encode(phrase) for phrase in phrases]
        phrase_embeddings[(page, chunk_number)] = list(zip(phrases, embeddings))

    # Load TinyLlama
    print("Loading TinyLlama model...", flush=True)
    tokenizer = AutoTokenizer.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    llm_model = AutoModelForCausalLM.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    print("TinyLlama model loaded.", flush=True)
    
    # Question generation
    def generate_questions(chunk_text, key_phrases):
        phrase_hint = f"\n\nKey phrases to focus on: {', '.join(key_phrases)}" if key_phrases else ""
        prompt = f"""### Instruction:
You are an AI trained to generate insightful and educational questions from study material.

### Input:
Context: {chunk_text}{phrase_hint}

### Task:
Generate 3 relevant and non-trivial questions based on the context.

### Questions:
"""
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=2048)
        outputs = llm_model.generate(**inputs, max_new_tokens=300, do_sample=True,temperature=0.7,pad_token_id=tokenizer.eos_token_id)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return result.split("### Questions:")[-1].strip()

    # Collect top N chunks
    top_n_chunks = 5
    top_chunks = list(chunk_phrases.items())[:top_n_chunks]

    # Generate questions
    questions_output = {}
    for (page, chunk_number), phrases in top_chunks:
        chunk_text = page_chunks[page][chunk_number - 1]
        key_phrases = phrases[:5]
        questions = generate_questions(chunk_text, key_phrases)
        questions_output[f"Page {page}, Chunk {chunk_number}"] = questions

    return questions_output

# Run when executed directly
if __name__ == "__main__":
    path = sys.argv[1]
    results = run_pipeline(path)
    with open("ml/questions_output.json", "w") as f:
        json.dump(results, f, indent=2)
