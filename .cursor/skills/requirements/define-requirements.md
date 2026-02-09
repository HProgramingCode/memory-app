---
name: define-requirements
description: |
  Clarify and structure user requirements into actionable and complete specifications.
  This skill identifies missing information, assumptions, and scope, preparing a clear
  base for implementation.
license: Complete terms in LICENSE.txt
---

## Purpose
Transform user-provided feature requests or ideas into well-defined requirements
that are actionable for both frontend and backend implementation. Identify ambiguities,
missing details, and constraints.

このスキルは、ユーザーの要望やアイデアを、フロントエンドとバックエンドの
実装に直接使える形に整理し、不明瞭な点や不足している情報を明確化します。

## When to use
- When a new feature or component is requested
- Before any design or implementation skill is used
- When requirements are unclear, partial, or scattered

新しい機能やコンポーネントの依頼があったとき。
設計や実装の前に実行する。
要件が不明瞭、断片的、または曖昧な場合に使用する。

## Do NOT use when
- Requirements are already fully defined and agreed upon
- Only minor tweaks or bug fixes are requested
- Task is strictly implementation without new requirements

要件がすでに確定している場合。
小さな修正やバグ修正のみの場合。
新しい要件がない実装作業の場合は使用しない。

## Input
- User description of desired feature, component, page, or system
- Any context about purpose, audience, constraints, or references

ユーザーからの機能・コンポーネント・ページ・システムに関する説明
目的、対象、制約条件、参考情報などがあれば含む

## Output
- Structured requirement list in Markdown:
  - Functional requirements
  - Non-functional requirements (performance, accessibility, constraints)
  - Missing information or assumptions
  - Suggested clarifying questions
- Should be actionable for both frontend and backend implementation

出力は Markdown 形式で整理された要件リスト：
- 機能要件
- 非機能要件（性能、アクセシビリティ、制約など）
- 不足している情報や前提条件
- 明確化のための質問案
フロントエンドとバックエンド両方の実装に活用可能な形にする

## Execution Guidelines
- Ask clarifying questions if any ambiguity exists
- Organize requirements hierarchically (major feature → sub-feature → detail)
- Keep language concise but precise
- Highlight constraints and dependencies explicitly

不明瞭な部分がある場合は質問を返す
要件を階層化して整理（大機能→小機能→詳細）
簡潔かつ正確な表現を使う
制約や依存関係を明示する