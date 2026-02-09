---
name: design-and-implement-backend
description: |
  Design and implement production-grade backend systems according to requirements
  and chosen technology stack. Generates maintainable, scalable, and testable backend code.
license: Complete terms in LICENSE.txt
---

## Purpose
Create robust backend systems that implement the requirements with clear architecture,
layered structure, and maintainable code. Focus on correctness, scalability, and long-term maintainability.

要件に従い、堅牢なバックエンドシステムを設計・実装します。
明確なアーキテクチャ、レイヤー構造、保守性の高いコードに重点を置きます。

## Input
- Structured requirements from `define-requirements`
- Technology stack information from `decide-tech-stack`
- Optional architectural constraints or preferences

入力：
- define-requirements から整理済み要件
- decide-tech-stack からの技術選定情報
- 任意のアーキテクチャ制約や好み

## Output
- Markdown-wrapped code blocks for:
  - API endpoints / controllers
  - Business logic / services
  - Domain models
  - Infrastructure / database access
- Include explanations or comments for clarity
- Should be production-ready, maintainable, and testable

出力：
- Markdown コードブロックでの実装例：
  - API エンドポイント / コントローラー
  - ビジネスロジック / サービス
  - ドメインモデル
  - インフラ / DBアクセス
- コメントや説明を含め可読性を確保
- 本番品質で保守性・テスト可能なコード

## Execution Guidelines
- Follow layered architecture: Controller → Service/UseCase → Domain → Infrastructure
- Keep data flow explicit and avoid hidden side-effects
- Implement strong typing (TypeScript, C#, etc.)
- Handle errors consistently and centrally
- Avoid leaking database models directly to API responses
- Prefer boring, proven patterns over clever abstractions unless justified
- Ensure code is readable, maintainable, and testable

実行ガイドライン：
- レイヤードアーキテクチャに従う：Controller → Service/UseCase → Domain → Infrastructure
- データフローは明示的に、隠れた副作用は避ける
- 型安全を確保（TypeScript / C# 等）
- エラーは一貫して中央で処理
- DBモデルを直接 API レスポンスに返さない
- 不要な抽象化は避け、実証済みのパターンを優先
- コードは読みやすく保守可能、テスト可能にする