<?php
function csv_read_all(string $filePath): array {
    if (!file_exists($filePath)) return [];
    $fh = fopen($filePath, 'r');
    if (!$fh) return [];
    flock($fh, LOCK_SH);
    $header = fgetcsv($fh, null, ',', '"', '\\');
    $rows = [];
    if ($header !== false) {
        while (($row = fgetcsv($fh, null, ',', '"', '\\')) !== false) {
            if (count($row) === count($header)) {
                $rows[] = array_combine($header, $row);
            }
        }
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $rows;
}

function csv_append_row(string $filePath, array $row, array $header): void {
    $isNew = !file_exists($filePath) || filesize($filePath) === 0;
    $fh = fopen($filePath, 'a');
    if (!$fh) throw new RuntimeException("No se pudo abrir $filePath");
    flock($fh, LOCK_EX);
    if ($isNew) fputcsv($fh, $header, ',', '"', '\\');
    fputcsv($fh, $row, ',', '"', '\\');
    flock($fh, LOCK_UN);
    fclose($fh);
}

function csv_next_id(string $filePath): int {
    $rows = csv_read_all($filePath);
    if (empty($rows)) return 1;
    return max(array_map(fn($r) => (int)$r['id'], $rows)) + 1;
}

function csv_delete_row(string $filePath, int $id): bool {
    if (!file_exists($filePath)) return false;
    $fh = fopen($filePath, 'r');
    if (!$fh) return false;
    flock($fh, LOCK_SH);
    $header = fgetcsv($fh, null, ',', '"', '\\');
    $keptRows = [];
    $found = false;
    if ($header !== false) {
        while (($row = fgetcsv($fh, null, ',', '"', '\\')) !== false) {
            if (count($row) !== count($header)) continue;
            $assoc = array_combine($header, $row);
            if ((int)$assoc['id'] === $id) {
                $found = true;
                continue;
            }
            $keptRows[] = $row;
        }
    }
    flock($fh, LOCK_UN);
    fclose($fh);

    if (!$found) return false;

    $tmpPath = $filePath . '.tmp';
    $out = fopen($tmpPath, 'w');
    if (!$out) throw new RuntimeException("No se pudo escribir $tmpPath");
    flock($out, LOCK_EX);
    fputcsv($out, $header, ',', '"', '\\');
    foreach ($keptRows as $row) {
        fputcsv($out, $row, ',', '"', '\\');
    }
    flock($out, LOCK_UN);
    fclose($out);
    rename($tmpPath, $filePath);
    return true;
}

function csv_escape_multiline(string $value): string {
    return str_replace(["\r\n", "\r", "\n"], '\\n', $value);
}

function csv_restore_multiline(string $value): string {
    return str_replace('\\n', "\n", $value);
}