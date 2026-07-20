from typing import List, Dict, Any, Tuple

class PromptBuilder:
    """Constructs grounded context prompts for LLM answer generation."""

    SYSTEM_PROMPT = (
        "You are InsightRAG, an intelligent AI research and document assistant. "
        "Your task is to provide accurate, concise, and grounded answers strictly based on the provided context passages. "
        "Rules:\n"
        "1. Do not use external knowledge that contradicts or is not mentioned in the context.\n"
        "2. If the answer cannot be found in the context, explicitly state: 'I could not find a clear answer in the provided documents.'\n"
        "3. Keep your explanation structured, objective, and professional.\n"
        "4. Refer to facts clearly without inventing citations."
    )

    @staticmethod
    def build_rag_prompt(query: str, chunks: List[Dict[str, Any]]) -> Tuple[str, str]:
        """Formats query and top retrieved chunks into system and user prompts.

        Args:
            query (str): User question.
            chunks (List[Dict[str, Any]]): Retrieved text chunks with metadata.

        Returns:
            Tuple[str, str]: (System Prompt, User Prompt)
        """
        context_str = ""
        for idx, chunk in enumerate(chunks, 1):
            doc_id = chunk.get("document_id", "Unknown Doc")
            page_num = chunk.get("page_number", "N/A")
            text = chunk.get("text", "")
            
            context_str += f"[Passage {idx} | Document ID: {doc_id} | Page: {page_num}]\n{text}\n\n"

        user_prompt = (
            f"Context Passages:\n"
            f"-----------------\n"
            f"{context_str.strip()}\n"
            f"-----------------\n\n"
            f"Question: {query}\n\n"
            f"Answer:"
        )

        system_prompt = PromptBuilder.SYSTEM_PROMPT.strip()
        return system_prompt, user_prompt
