---
name: decide-tech-stack
description: |
  Choose a suitable technology stack for a feature or system based on requirements,
  constraints, and team context. Provide reasoning and alternatives.
license: Complete terms in LICENSE.txt
---

## Purpose
Determine the most appropriate technologies (frontend, backend, database, frameworks,
libraries, and tools) to implement the given requirements. Include rationale and
alternative options when relevant.

要件に基づき、最適な技術（フロントエンド、バックエンド、DB、フレームワーク、
ライブラリ、ツールなど）を選定します。必要に応じて理由や代替案も提示します。

## When to use
- After `define-requirements` has clarified feature and system needs
- Before starting architecture design or implementation
- When technology choices impact performance, maintainability, or integration

要件整理後、設計・実装を始める前
技術選定が性能・保守性・統合に影響する場合

## Do NOT use when
- Technology stack is already mandated or fixed
- Only minor implementation tweaks are needed
- Task is purely design or frontend/backend coding

技術選定が既に決まっている場合
小規模な修正のみの場合
設計や実装作業のみの場合

## Input
- Structured requirement list from `define-requirements`
- Constraints: budget, team expertise, deployment environment, performance targets
- Optional references or preferred frameworks/libraries

define-requirements からの整理済み要件
制約条件（予算、チームスキル、環境、性能目標）
任意：推奨フレームワークやライブラリ

## Output
- Technology stack recommendation in Markdown, including:
  - Frontend framework/library
  - Backend framework/language
  - Database type
  - DevOps/deployment tools
  - Any optional libraries or tools
- Reasoning for each choice
- Alternatives if main choice is unsuitable
- Constraints or trade-offs highlighted

Markdown形式での技術スタック推奨：
- フロントエンドフレームワーク／ライブラリ
- バックエンドフレームワーク／言語
- データベースの種類
- DevOps／デプロイ手法
- 任意ライブラリやツール
各選定理由と、主要選択が不適切な場合の代替案も提示
制約やトレードオフを明示

## Execution Guidelines
- Prioritize maintainability, scalability, and team familiarity
- Avoid exotic or highly experimental technologies unless justified
- Explicitly note any dependencies or constraints
- Provide clear rationale for every major choice

保守性・拡張性・チーム熟練度を優先
理由がない限り、極端に新しい・実験的な技術は避ける
依存関係や制約を明示
主要な選択には必ず理由を添付