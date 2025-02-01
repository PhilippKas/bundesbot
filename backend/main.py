from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os

from dotenv import load_dotenv

from langchain import hub
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatOpenAI(model="gpt-4o-mini", openai_api_key = api_key)
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", openai_api_key = api_key)
vector_store = Chroma(embedding_function=embeddings, persist_directory = "./chroma_db")

# Request Model
class QueryRequest(BaseModel):
    question: str
    source: str

@app.post("/ask")
def ask_question(request: QueryRequest):
    party_to_source = {
        "spd": "https://mehr.spd.de/custom-static-assets/documents/Regierungsprogramm.pdf",
        "cdu": "https://www.politikwechsel.cdu.de/sites/www.politikwechsel.cdu.de/files/docs/politikwechsel-fuer-deutschland-wahlprogramm-von-cdu-csu-1.pdf",
        "grune": "https://cms.gruene.de/uploads/assets/20241216_BTW25_Programmentwurf_DINA4_digital.pdf",
        "fdp": "https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf",
        "nazis": "Leitantrag-Bundestagswahlprogramm-2025.pdf",
        "linke": "https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf",
        "kremel":"https://bsw-vg.de/wp-content/themes/bsw/assets/downloads/BSW%20Wahlprogramm%202025.pdf"
    }
    question = request.question.strip()
    party = request.source.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    retrieved_docs = vector_store.similarity_search(question, filter={"source": party_to_source[party]})
    

    
    context = [f'{doc.page_content} - S.{doc.metadata.get("page", "Unknown")} {doc.metadata.get("source", "Unknown")}' for doc in retrieved_docs]

    if not context:
        return {"context": "No relevant documents found.", "answer": "I couldn't find an answer."}
    
    prompt = hub.pull("rlm/rag-prompt")
    
    messages = prompt.invoke({"question": question, "context": context})
    response = llm.invoke(messages)
    print(context)
    return {"context": context, "answer": response.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)




