import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import chromadb
from google import genai
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env
load_dotenv()

# Cấu hình Google Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "dien_api_key_cua_ban_vao_day":
    print("CẢNH BÁO: Bạn chưa thiết lập GEMINI_API_KEY trong file .env")

client = genai.Client(api_key=api_key)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Sales Assistant API")

# Cấu hình CORS để cho phép React Frontend kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả các nguồn hoặc bạn có thể chỉ định ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo ChromaDB - Lưu trữ dữ liệu cục bộ trong thư mục 'chroma_data'
chroma_client = chromadb.PersistentClient(path="./chroma_data")
# Tạo hoặc lấy bảng (collection) lưu sản phẩm
collection = chroma_client.get_or_create_collection(name="products")

# Cấu trúc dữ liệu Sản phẩm nhận từ Java
class ProductData(BaseModel):
    id: str
    name: str
    price: float
    description: str
    category: str

# Cấu trúc dữ liệu Tin nhắn nhận từ Frontend
class ChatMessage(BaseModel):
    message: str

import requests

# BỎ hàm get_embedding gọi API Google. 
# ChromaDB sẽ tự động sử dụng mô hình AI nhúng Vector cục bộ (all-MiniLM-L6-v2) 
# chạy trực tiếp trên RAM máy tính của bạn (mất ~0.02s thay vì 1-2s gọi API).

@app.post("/api/ai/sync-all-from-source")
async def sync_all_from_source():
    """API đặc biệt: Gọi 1 lần để kéo toàn bộ dữ liệu từ Java sang AI (Pull)"""
    try:
        # Gọi API của Java để lấy danh sách sản phẩm (size=10000 để lấy tối đa)
        java_api_url = "http://localhost:8080/api/products?size=10000"
        response = requests.get(java_api_url)
        if response.status_code != 200:
            return {"status": "error", "message": "Không thể kết nối đến Java Server"}
        
        # Spring Boot trả về Page, danh sách sản phẩm nằm trong trường 'content'
        data = response.json()
        products = data.get("content", [])
        
        count = 0
        for p in products:
            desc = p.get("shortDescription", "")
            if p.get("description"):
                desc += " - " + p.get("description")
                
            document_text = f"Tên sản phẩm: {p.get('name')}\nGiá: {p.get('price')} VNĐ\nDanh mục: {p.get('categoryName', '')}\nMô tả: {desc}"
            
            collection.upsert(
                documents=[document_text],
                metadatas=[{"id": str(p.get("id")), "name": p.get("name"), "price": float(p.get("price", 0))}],
                ids=[str(p.get("id"))]
            )
            count += 1
            
        return {"status": "success", "message": f"Đã học (Sync) thành công {count} sản phẩm từ Java."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/sync")
async def sync_product(product: ProductData):
    """API để Java gọi sang mỗi khi Thêm/Sửa sản phẩm"""
    try:
        # 1. Tạo đoạn văn bản chứa thông tin sản phẩm
        document_text = f"Tên sản phẩm: {product.name}\nGiá: {product.price} VNĐ\nDanh mục: {product.category}\nMô tả: {product.description}"
        
        # 2. Lưu/Cập nhật vào ChromaDB (Nó sẽ TỰ ĐỘNG nhúng Vector cục bộ cực nhanh)
        collection.upsert(
            documents=[document_text],
            metadatas=[{"id": product.id, "name": product.name, "price": product.price}],
            ids=[str(product.id)]
        )
        return {"status": "success", "message": f"Đã đồng bộ sản phẩm: {product.name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/sync/delete")
async def delete_product(product_id: str):
    """API để Java gọi sang mỗi khi Xóa sản phẩm"""
    try:
        collection.delete(ids=[product_id])
        return {"status": "success", "message": f"Đã xóa sản phẩm ID: {product_id} khỏi AI"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
async def chat_bot(chat: ChatMessage):
    """API để Frontend gọi vào khi Khách nhắn tin"""
    try:
        import asyncio
        results = await asyncio.to_thread(
            collection.query,
            query_texts=[chat.message],
            n_results=3
        )
        
        # 3. Lắp ráp dữ liệu sản phẩm tìm được
        context_docs = results['documents'][0] if results['documents'] else []
        context_text = "\n\n---\n\n".join(context_docs)
        
        # Nếu cửa hàng chưa có sản phẩm nào
        if not context_text:
            context_text = "Hiện tại cửa hàng chưa có thông tin sản phẩm nào."

        # 4. Tạo System Prompt (Nhắc nhở AI về vai trò của nó)
        system_prompt = f"""Bạn là trợ lý AI tư vấn bán hàng thân thiện, chuyên nghiệp và lịch sự của cửa hàng.
Nhiệm vụ của bạn là trả lời câu hỏi và tư vấn sản phẩm dựa vào thông tin của cửa hàng dưới đây.
Tuyệt đối KHÔNG ĐƯỢC bịa đặt sản phẩm, giá cả, hoặc thông tin không có trong danh sách.
Nếu khách hàng hỏi ngoài lề không liên quan tới mua bán sản phẩm, hãy từ chối khéo léo.

THÔNG TIN CÁC SẢN PHẨM PHÙ HỢP TRONG CỬA HÀNG:
{context_text}
"""
        
        # 4. Gọi mô hình Gemini với chế độ Bất đồng bộ (Async) để tăng tốc I/O mạng
        async def stream_generator():
            response_stream = await client.aio.models.generate_content_stream(
                model="gemini-3.5-flash",
                contents=chat.message,
                config=genai.types.GenerateContentConfig(
                    system_instruction=system_prompt,
                )
            )
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
                    
        # Trả về Stream thẳng xuống Frontend
        return StreamingResponse(stream_generator(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
