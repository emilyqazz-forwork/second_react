import { drizzle } from "drizzle-orm/node-postgres";
// Drizzle ORM을 Node.js + PostgreSQL 환경에서 사용하기 위한 도구를 가져옵니다.

import pg from "pg";
// PostgreSQL 데이터베이스 연결 라이브러리를 가져옵니다.

import * as schema from "./schema";
// 테이블 정의 파일들(conversations, messages, users)을 전부 가져옵니다.

const { Pool } = pg;
// pg 라이브러리에서 Pool(커넥션 풀)만 꺼내서 사용합니다.
// 커넥션 풀: DB 연결을 여러 개 미리 만들어두고 재사용하는 방식입니다.

// DATABASE_URL 환경변수가 없으면 즉시 에러를 던집니다.
// DB 주소 없이 실행되는 것을 방지하는 안전장치입니다.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// .env 파일의 DATABASE_URL을 이용해 실제 DB 연결 풀을 생성합니다.

export const db = drizzle(pool, { schema });
// pool과 schema를 묶어 Drizzle db 객체를 생성합니다.
// 다른 파일에서 이 db를 import해서 쿼리를 실행합니다.

export * from "./schema";
// 테이블 타입들(Conversation, Message, User 등)도 여기서 함께 내보냅니다.
// 외부에서 db와 타입을 이 파일 하나에서 모두 가져올 수 있습니다.