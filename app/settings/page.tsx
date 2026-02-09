"use client";

import { useRef, useState } from "react";
import {
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { format } from "date-fns";
import AppLayout from "@/components/common/AppLayout";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useDeckStore } from "@/stores/useDeckStore";
import { useCardStore } from "@/stores/useCardStore";
import { useStudyStore } from "@/stores/useStudyStore";
import { exportAllData, downloadJson, importAllData } from "@/lib/exportImport";

/**
 * 設定画面
 */
export default function SettingsPage() {
  const decks = useDeckStore((s) => s.decks);
  const cards = useCardStore((s) => s.cards);

  const replaceDeckAll = useDeckStore((s) => s.replaceAll);
  const replaceCardAll = useCardStore((s) => s.replaceAll);
  const replaceStudyAll = useStudyStore((s) => s.replaceAll);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      const date = format(new Date(), "yyyyMMdd-HHmmss");
      downloadJson(json, `memory-app-backup-${date}.json`);
      setSnackbar({
        open: true,
        message: "エクスポートが完了しました",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "エクスポートに失敗しました",
        severity: "error",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImportConfirmOpen(true);
    // inputをリセット
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportConfirm = async () => {
    setImportConfirmOpen(false);
    if (!pendingFile) return;

    try {
      const text = await pendingFile.text();
      const { decks: d, cards: c, studyRecords: s } = await importAllData(text);
      replaceDeckAll(d);
      replaceCardAll(c);
      replaceStudyAll(s);
      setSnackbar({
        open: true,
        message: "インポートが完了しました",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "インポートに失敗しました。ファイル形式を確認してください。",
        severity: "error",
      });
    }
    setPendingFile(null);
  };

  return (
    <AppLayout>
      <Typography variant="h5" sx={{ mb: 3 }}>
        設定
      </Typography>

      {/* データ管理 */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            データ管理
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            データはサーバー上のデータベースに保存されています。バックアップを取ることを推奨します。
          </Typography>

          <Stack spacing={2}>
            {/* エクスポート */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  データのエクスポート
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  全てのデッキ・カード・学習記録・画像をJSONファイルとしてダウンロードします。
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExport}
                >
                  エクスポート
                </Button>
              </CardContent>
            </Card>

            <Divider />

            {/* インポート */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  データのインポート
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  JSONファイルをアップロードして、現在のデータを完全に置き換えます。
                </Typography>
                <Alert severity="warning" sx={{ mb: 1 }}>
                  インポートすると現在のデータは全て上書きされます
                </Alert>
                <Button
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  インポート
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </CardContent>
            </Card>
          </Stack>
        </CardContent>
      </Card>

      {/* アプリ情報 */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            アプリ情報
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Memory App v1.0.0 — Phase 1 (ローカル完結型MVP)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            デッキ数: {decks.length} / カード数: {cards.length}
          </Typography>
        </CardContent>
      </Card>

      {/* インポート確認ダイアログ */}
      <ConfirmDialog
        open={importConfirmOpen}
        title="データのインポート"
        message="現在の全てのデータ（デッキ・カード・学習記録・画像）が上書きされます。この操作は元に戻せません。続行しますか？"
        confirmLabel="インポート"
        onConfirm={handleImportConfirm}
        onCancel={() => {
          setImportConfirmOpen(false);
          setPendingFile(null);
        }}
      />

      {/* スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
