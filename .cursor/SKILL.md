# Cursor Skills Index

This file maps all available skills and defines their responsibilities, input/output,
and recommended execution order for Agent usage.

このファイルは、Cursor に登録されているスキルを一覧化し、
それぞれの役割、入出力、実行順序を整理したものです。

---

## Core Principles

- One skill = one responsibility
- Follow the recommended skill flow
- Ask for clarification if requirements are unclear

スキルは一つの責務に限定
推奨される実行順序に従う
要件が不明瞭な場合は必ず確認質問を返す

---

## Skill Flow

1. define-requirements
2. decide-tech-stack
3. design-frontend-aesthetic-direction
4. frontend-design
5. design-and-implement-backend
6. prisma-setup (DB 導入時)
7. manage-tasks-and-progress
8. maintain-architecture-doc (コード変更後に随時実行)

---

## Skills

### Requirements

- `define-requirements`  
  Clarifies goals, scope, and constraints; identifies missing information  
  日本語補足: 依頼内容を整理し、不明点を明確化。実装前に必ず実行

### Tech Stack

- `decide-tech-stack`  
  Chooses frameworks, languages, and tools with rationale and alternatives  
  日本語補足: 要件に基づき技術選定。理由と代替案も提示

### Frontend Aesthetics

- `design-frontend-aesthetic-direction`  
  Defines a clear, distinctive visual direction for frontend implementation  
  日本語補足: フロントエンドの美学方向性を決定。frontend-design が従う

### Frontend Implementation

- `frontend-design`  
  Implements production-grade frontend according to the aesthetic direction  
  日本語補足: 美学方向性に沿って、視覚的に特徴的で機能的なコードを生成

### Backend Implementation

- `design-and-implement-backend`  
  Designs and implements robust backend systems according to requirements and tech stack  
  日本語補足: 要件と技術選定に基づき、保守性・拡張性の高いバックエンドを設計・実装

### Prisma ORM Setup

- `prisma-setup`  
  Sets up Prisma ORM (v7) with SQLite in a Next.js project, including API Routes and Zustand store integration  
  日本語補足: Next.js プロジェクトに Prisma ORM を導入。スキーマ定義、API Routes、ストア連携のパターンを提供

### Task Management

- `manage-tasks-and-progress`  
  Tracks tasks, status, and next actions to ensure smooth workflow  
  日本語補足: タスクと進捗管理。チーム内共有や次のアクションの把握に使用

### Documentation

- `maintain-architecture-doc`  
  Creates and maintains ARCHITECTURE.md for human understanding and handover  
  日本語補足: ARCHITECTURE.md の作成・更新。コード変更時に設計ドキュメントを実態と同期させる
