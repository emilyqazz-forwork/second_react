import os
import json
import hashlib
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

try:
    from google import genai
except Exception as e:
    print(f"❌ 라이브러리 로드 실패: {e}")
    genai = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = "비밀임ㅋ 내가 쉽게 알려줄거같아?"
USERS_FILE = "users.json"

client = None
if genai and GOOGLE_API_KEY:
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as e:
        print(f"❌ 클라이언트 초기화 에러: {e}")

# --- 유저 저장소 ---
def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

# --- 모델 정의 ---
class HintRequest(BaseModel):
    user_code: str
    problem_context: str

class HistoryItem(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    user_question: str
    user_code: str
    problem_context: str
    history: Optional[List[HistoryItem]] = []

class RegisterRequest(BaseModel):
    username: str
    password: str
    nickname: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --- 회원가입 ---
@app.post("/register")
async def register(req: RegisterRequest):
    users = load_users()
    if req.username in users:
        return {"success": False, "message": "이미 존재하는 아이디야 삐약!"}
    if len(req.username) < 3:
        return {"success": False, "message": "아이디는 3자 이상이어야 해 삐약!"}
    if len(req.password) < 4:
        return {"success": False, "message": "비밀번호는 4자 이상이어야 해 삐약!"}
    users[req.username] = {
        "password": hash_password(req.password),
        "nickname": req.nickname
    }
    save_users(users)
    return {"success": True, "message": f"가입 완료! 어서와 {req.nickname}! 삐약! 🐥"}

# --- 로그인 ---
@app.post("/login")
async def login(req: LoginRequest):
    users = load_users()
    if req.username not in users:
        return {"success": False, "message": "가입한 적 없는 아이디야 삐약!"}
    if users[req.username]["password"] != hash_password(req.password):
        return {"success": False, "message": "비밀번호가 일치하지 않아 삐약!"}
    nickname = users[req.username]["nickname"]
    return {"success": True, "nickname": nickname, "message": f"어서와 {nickname}! 삐약! 🐥"}

# --- 힌트 생성 ---
@app.post("/generate-hint")
async def generate_hint(request: HintRequest):
    if not client:
        return {"hint": "API 키 설정이 안 됐어 삐약!"}
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"너는 병아리 선배야. 정답 코드를 말하지 말고 힌트만 줘. 문제: {request.problem_context}, 현재코드: {request.user_code}"
        )
        return {"hint": response.text}
    except Exception as e:
        return {"hint": f"힌트 생각하다 머리가 띵해 삐약! 사유: {str(e)}"}

# --- AI 채팅 ---
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not client:
        return {"answer": "API 키 설정이 안 됐어 삐약!"}
    try:
        history_str = ""
        if request.history:
            for h in request.history[:-1]:
                role_label = "사용자" if h.role == "user" else "병아리 선배"
                history_str += f"{role_label}: {h.text}\n"

        prompt = (
            "너는 '병아리 선배'야. 초보 자바 개발자를 돕는 친근한 멘토 캐릭터야.\n"
            "말투는 친근한 반말이고, 문장 끝에 가끔 '삐약!'을 붙여.\n\n"
            "대화 규칙:\n"
            "1. 사용자가 인사하거나 감정 표현('야!', '안녕', '헐' 등)을 하면 자연스럽게 반응해.\n"
            "2. 칭찬이나 감사 표현엔 따뜻하게 반응해.\n"
            "3. 코딩 질문엔 절대 정답 코드를 직접 주지 말고, 방향과 핵심 개념만 알려줘.\n"
            "4. 욕설이나 부정적 말엔 부드럽게 달래줘.\n"
            "5. 현재 문제와 관련 없는 일상 대화도 자연스럽게 받아줘.\n"
            "6. 이전 대화 맥락을 기억하고 자연스럽게 이어가.\n"
            "7. 너무 길게 설명하지 말고 핵심만 간결하게 말해줘.\n\n"
            f"[이전 대화]\n{history_str}\n"
            f"[현재 문제]: {request.problem_context or '없음'}\n"
            f"[사용자 코드]: {request.user_code or '없음'}\n"
            f"[사용자 메시지]: {request.user_question}"
        )
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return {"answer": response.text or "음... 다시 한번 말해줄래? 삐약!"}
    except Exception as e:
        print(f"❌ 채팅 에러: {e}")
        return {"answer": f"앗, 에러가 났어 삐약! 사유: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)