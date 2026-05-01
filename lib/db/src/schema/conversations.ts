import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
// PostgreSQL 테이블/컬럼 타입 정의 도구들을 가져옵니다.

import { createInsertSchema } from "drizzle-zod";
// Drizzle 테이블 정의로부터 Zod 유효성 검사 스키마를 자동 생성해주는 도구입니다.

import { z } from "zod/v4";
// TypeScript용 유효성 검사 라이브러리입니다.

// "conversations" 테이블 구조를 정의합니다.
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),          // 자동 증가하는 고유 ID (1, 2, 3...)
  title: text("title").notNull(),          // 대화 제목 (필수값)
  createdAt: timestamp("created_at", { withTimezone: true }) // 생성 시각 (시간대 포함)
    .defaultNow()                          // 기본값: 현재 시각 자동 입력
    .notNull(),                            // 필수값
});

// 데이터 삽입 시 사용할 유효성 검사 스키마입니다.
// id와 createdAt은 DB가 자동으로 채워주므로 제외(omit)합니다.
// → 즉, 삽입할 때는 title만 받습니다.
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

// DB에서 조회한 데이터의 TypeScript 타입 (id, title, createdAt 모두 포함)
export type Conversation = typeof conversations.$inferSelect;

// 삽입할 때 사용하는 TypeScript 타입 (title만 포함)
export type InsertConversation = z.infer<typeof insertConversationSchema>;