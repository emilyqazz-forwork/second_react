import os
import json
import hashlib
import asyncio
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

load_dotenv()

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

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
USERS_FILE = "users.json"

client = None
if genai and GOOGLE_API_KEY:
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as e:
        print(f"❌ 클라이언트 초기화 에러: {e}")

# --- 사용 가능한 모델 순서 (할당량 초과 시 다음으로 넘어감) ---
MODELS = [
    'gemini-2.5-flash-lite',   # 하루 1000회 - 메인
    'gemini-2.0-flash-lite',   # 백업 1
    'gemini-2.0-flash',        # 백업 2
]

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
    hint_level: Optional[int] = 1

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

    prompt = (
        "[[절대 규칙: 한 문장, 50글자 이내, 핵심만]]\n"
        "너는 병아리 선배야. 아래 규칙을 반드시 따라:\n"
        "- 정답 코드 절대 금지\n"
        "- 한 문장으로만 답할 것\n"
        "- 비유, 감탄사, 인사말 금지\n"
        "- 삐약은 마지막에 딱 한 번\n\n"
        "좋은 예: '+로 문자열을 연결하고 println()으로 출력해봐 삐약!'\n"
        "나쁜 예: '후배님~ 두 개의 모이를 합치듯이 생각해봐!'\n\n"
        f"힌트 단계: {request.hint_level} (1=방향만, 2=문법 언급, 3=강한 단서)\n"
        f"문제: {request.problem_context}\n"
        f"현재 코드: {request.user_code}"
    )

    for model in MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            hint_text = response.text or ""
            if len(hint_text) > 60:
                hint_text = hint_text[:57] + "..."
            return {"hint": hint_text}
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "503" in err_str or "404" in err_str:
                await asyncio.sleep(1)
                continue
            return {"hint": f"힌트 생각하다 머리가 띵해 삐약! 사유: {err_str}"}

    return {"hint": "오늘 힌트 횟수를 다 썼어 삐약! 내일 다시 물어봐! 🐥"}

# --- AI 채팅 ---
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not client:
        return {"answer": "API 키 설정이 안 됐어 삐약!"}

    history_str = ""
    if request.history:
        for h in request.history[:-1]:
            role_label = "사용자" if h.role == "user" else "병아리 선배"
            history_str += f"{role_label}: {h.text}\n"

    prompt = (
        "[[절대 규칙: 두 문장 이내, 80글자 이내, 핵심만]]\n"
        "너는 '병아리 선배'야. 초보 자바 개발자를 돕는 멘토야.\n"
        "말투는 친근한 반말, 끝에 가끔 '삐약!' 한 번만.\n\n"
        "규칙:\n"
        "1. 인사·감정 표현엔 짧게 자연스럽게 반응 (한 문장)\n"
        "2. 코딩 질문엔 정답 코드 절대 금지, 방향만 한 문장\n"
        "3. 비유, 감탄사, 긴 서론 금지\n"
        "4. 이전 대화 맥락 기억하되 항상 짧게\n\n"
        "좋은 예(인사): '오 왔어? 뭐가 막혔어 삐약!'\n"
        "나쁜 예(인사): '후배님 안녕하세요~ 오늘도 수고 많다 삐약삐약!'\n"
        "좋은 예(질문): 'System.out.println() 써봐 삐약!'\n"
        "나쁜 예(질문): '음~ 모이를 합치듯이 생각해보면...'\n\n"
        f"[이전 대화]\n{history_str}\n"
        f"[현재 문제]: {request.problem_context or '없음'}\n"
        f"[사용자 코드]: {request.user_code or '없음'}\n"
        f"[사용자 메시지]: {request.user_question}"
    )

    for model in MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            answer_text = response.text or "음... 다시 한번 말해줄래? 삐약!"
            if len(answer_text) > 80:
                answer_text = answer_text[:77] + "..."
            return {"answer": answer_text}
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "503" in err_str or "404" in err_str:
                await asyncio.sleep(1)
                continue
            print(f"❌ 채팅 에러: {err_str}")
            return {"answer": f"앗, 에러가 났어 삐약! 사유: {err_str}"}

    return {"answer": "오늘 대화 횟수를 다 썼어 삐약! 내일 다시 물어봐! 🐥"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)