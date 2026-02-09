---
name: manage-tasks-and-progress
description: |
  Decompose work into executable tasks, manage progress explicitly,
  and control execution flow according to requirements and constraints.
license: Complete terms in LICENSE.txt
---

## Purpose
Provide clear task decomposition, progress visibility, and safe execution flow
from requirements definition through implementation completion.
Ensure work proceeds predictably without assumptions or unintended changes.

要件定義から実装完了までの作業を整理し、
タスク分解・進捗管理・実行順制御を明確に行います。
推測や暴走を防ぎ、安全で予測可能な進行を保証します。

## Input
- Structured requirements from `define-requirements`
- Design decisions and tech stack from `decide-tech-stack`
- Current progress or existing task list (if any)

入力：
- define-requirements から整理済み要件
- decide-tech-stack からの設計・技術選定情報
- 現在の進捗状況や既存タスクリスト（存在する場合）

## Output
- Markdown-formatted task lists or tables including:
  - Task description
  - Status (not started / in progress / done)
  - Clear completion criteria
- Explicit indication of the single next actionable task

出力：
- Markdown 形式のタスクリストまたは表：
  - タスク内容
  - 状態（未着手 / 進行中 / 完了）
  - 明確な完了条件
- 次に実行すべきタスクを1つ明示

## Execution Guidelines
- Decompose tasks into the smallest executable units
- Define explicit “done” criteria for every task
- Track progress explicitly; never infer or guess status
- Respect existing requirements, design, and tech stack
- Stop execution and list open questions when information is insufficient
- Keep output concise, structured, and free of speculation

実行ガイドライン：
- タスクは実行可能な最小単位まで分解
- すべてのタスクに明確な完了条件を設定
- 進捗は推測せず、明示的に管理
- 既存の要件・設計・技術スタックを厳守
- 不明点がある場合は実装せず確認事項として列挙
- 出力は簡潔かつ構造化し、推測や余談を含めない